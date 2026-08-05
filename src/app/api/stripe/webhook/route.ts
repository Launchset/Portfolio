import { getPortalEnvironment } from "@/src/lib/portal";
import { stripeId, stripeTimestamp, subscriptionPeriodEnd, verifyStripeSignature } from "@/src/lib/stripe";

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

type ClientLookup = { id: string };

export const dynamic = "force-dynamic";

function metadataClientId(object: Record<string, unknown>) {
  const metadata = object.metadata as Record<string, unknown> | undefined;
  return typeof metadata?.launchset_client_id === "string" ? metadata.launchset_client_id : null;
}

async function resolveClientId(database: D1Database, object: Record<string, unknown>) {
  const fromMetadata = metadataClientId(object);
  if (fromMetadata) return fromMetadata;
  const customerId = stripeId(object.customer);
  if (!customerId) return null;
  const client = await database.prepare("SELECT id FROM clients WHERE stripe_customer_id = ?").bind(customerId).first<ClientLookup>();
  return client?.id ?? null;
}

function subscriptionIdFromInvoice(invoice: Record<string, unknown>) {
  const legacy = stripeId(invoice.subscription);
  if (legacy) return legacy;
  const parent = invoice.parent as { subscription_details?: { subscription?: unknown } } | undefined;
  return stripeId(parent?.subscription_details?.subscription);
}

async function processSubscription(database: D1Database, subscription: Record<string, unknown>) {
  const clientId = await resolveClientId(database, subscription);
  if (!clientId) return;
  const subscriptionId = stripeId(subscription.id);
  const customerId = stripeId(subscription.customer);
  const status = typeof subscription.status === "string" ? subscription.status : "unknown";
  const collectionPaused = subscription.pause_collection && typeof subscription.pause_collection === "object" ? 1 : 0;
  const nextBillAt = subscriptionPeriodEnd(subscription);
  const cancelAtPeriodEnd = subscription.cancel_at_period_end === true ? 1 : 0;
  const clientStatus = status === "active" || status === "trialing" ? "active" : status === "canceled" ? "cancelled" : "contract_signed";
  const now = Date.now();
  await database.prepare(
    `UPDATE clients SET stripe_customer_id = COALESCE(?, stripe_customer_id), stripe_subscription_id = ?,
     stripe_subscription_status = ?, stripe_current_period_end = ?, stripe_cancel_at_period_end = ?,
     stripe_collection_paused = ?, status = ?, payment_updated_at = ?, updated_at = ? WHERE id = ?`,
  ).bind(customerId, subscriptionId, status, nextBillAt, cancelAtPeriodEnd, collectionPaused, clientStatus, now, now, clientId).run();
}

async function processCheckout(database: D1Database, session: Record<string, unknown>) {
  const clientId = metadataClientId(session) ?? (typeof session.client_reference_id === "string" ? session.client_reference_id : null);
  if (!clientId) return;
  const now = Date.now();
  await database.prepare(
    `UPDATE clients SET stripe_customer_id = COALESCE(?, stripe_customer_id),
     stripe_subscription_id = COALESCE(?, stripe_subscription_id), payment_updated_at = ?, updated_at = ? WHERE id = ?`,
  ).bind(stripeId(session.customer), stripeId(session.subscription), now, now, clientId).run();
}

async function processInvoice(database: D1Database, invoice: Record<string, unknown>) {
  const clientId = await resolveClientId(database, invoice);
  const invoiceId = stripeId(invoice.id);
  if (!clientId || !invoiceId) return;
  const statusTransitions = invoice.status_transitions as Record<string, unknown> | undefined;
  const now = Date.now();
  await database.prepare(
    `INSERT INTO billing_invoices (id, client_id, stripe_subscription_id, number, status, amount_due,
     amount_paid, currency, hosted_invoice_url, invoice_pdf, period_start, period_end, due_date, paid_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET status = excluded.status, amount_due = excluded.amount_due,
     amount_paid = excluded.amount_paid, hosted_invoice_url = excluded.hosted_invoice_url,
     invoice_pdf = excluded.invoice_pdf, due_date = excluded.due_date, paid_at = excluded.paid_at,
     period_start = excluded.period_start, period_end = excluded.period_end, updated_at = excluded.updated_at`,
  ).bind(
    invoiceId,
    clientId,
    subscriptionIdFromInvoice(invoice),
    typeof invoice.number === "string" ? invoice.number : null,
    typeof invoice.status === "string" ? invoice.status : "unknown",
    typeof invoice.amount_due === "number" ? invoice.amount_due : 0,
    typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0,
    typeof invoice.currency === "string" ? invoice.currency : "gbp",
    typeof invoice.hosted_invoice_url === "string" ? invoice.hosted_invoice_url : null,
    typeof invoice.invoice_pdf === "string" ? invoice.invoice_pdf : null,
    stripeTimestamp(invoice.period_start),
    stripeTimestamp(invoice.period_end),
    stripeTimestamp(invoice.due_date),
    stripeTimestamp(statusTransitions?.paid_at),
    stripeTimestamp(invoice.created) ?? now,
    now,
  ).run();
}

export async function POST(request: Request) {
  const environment = await getPortalEnvironment();
  if (!environment.STRIPE_WEBHOOK_SECRET) return new Response("Webhook is not configured.", { status: 503 });
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();
  if (!signature || !await verifyStripeSignature(payload, signature, environment.STRIPE_WEBHOOK_SECRET)) {
    return new Response("Invalid signature.", { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return new Response("Invalid payload.", { status: 400 });
  }
  if (!event.id || !event.type || !event.data?.object) return new Response("Invalid event.", { status: 400 });

  const receivedAt = Date.now();
  const claim = await environment.APP_DB.prepare(
    "INSERT OR IGNORE INTO stripe_webhook_events (id, type, received_at) VALUES (?, ?, ?)",
  ).bind(event.id, event.type, receivedAt).run();
  if ((claim.meta.changes ?? 0) === 0) return Response.json({ received: true, duplicate: true });

  try {
    if (event.type === "checkout.session.completed") await processCheckout(environment.APP_DB, event.data.object);
    if (event.type.startsWith("customer.subscription.")) await processSubscription(environment.APP_DB, event.data.object);
    if (event.type.startsWith("invoice.")) await processInvoice(environment.APP_DB, event.data.object);
    await environment.APP_DB.prepare(
      "UPDATE stripe_webhook_events SET processed_at = ? WHERE id = ?",
    ).bind(Date.now(), event.id).run();
    return Response.json({ received: true });
  } catch (error) {
    await environment.APP_DB.prepare("DELETE FROM stripe_webhook_events WHERE id = ?").bind(event.id).run();
    console.error("Stripe webhook processing failed", event.type, error);
    return new Response("Webhook processing failed.", { status: 500 });
  }
}
