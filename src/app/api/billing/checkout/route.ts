import { getClientAccess, getPortalEnvironment, getRequestUser } from "@/src/lib/portal";
import { stripeRequest } from "@/src/lib/stripe";

type CheckoutClient = {
  id: string;
  name: string;
  email: string;
  monthly_fee_cents: number;
  currency: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  contract_signed: number;
};

type StripeCustomer = { id: string };
type StripeCheckoutSession = { id: string; client_secret: string | null };

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });

  const user = await getRequestUser(request);
  if (!user?.emailVerified) return Response.json({ error: "A verified sign-in is required." }, { status: 401 });

  const access = await getClientAccess(user.email);
  if (!access) return Response.json({ error: "Client access is required." }, { status: 403 });

  const environment = await getPortalEnvironment();
  if (!environment.STRIPE_SECRET_KEY) return Response.json({ error: "Stripe test mode is not configured yet." }, { status: 503 });

  const client = await environment.APP_DB.prepare(
    `SELECT clients.id, clients.name, clients.email, clients.monthly_fee_cents, clients.currency,
     clients.stripe_customer_id, clients.stripe_subscription_id, clients.stripe_subscription_status,
     EXISTS(SELECT 1 FROM contracts WHERE contracts.client_id = clients.id AND contracts.status = 'signed') AS contract_signed
     FROM clients WHERE clients.id = ?`,
  ).bind(access.id).first<CheckoutClient>();

  if (!client) return Response.json({ error: "Client account not found." }, { status: 404 });
  if (!client.contract_signed) return Response.json({ error: "Sign the contract before setting up billing." }, { status: 409 });
  if (client.monthly_fee_cents <= 0) return Response.json({ error: "A maintenance price has not been set." }, { status: 409 });

  const existingStatuses = new Set(["active", "trialing", "past_due", "unpaid", "paused"]);
  if (client.stripe_subscription_id && existingStatuses.has(client.stripe_subscription_status ?? "")) {
    return Response.json({ error: "This maintenance subscription is already connected." }, { status: 409 });
  }

  try {
    let customerId = client.stripe_customer_id;
    if (!customerId) {
      const customer = await stripeRequest<StripeCustomer>(environment.STRIPE_SECRET_KEY, "/customers", {
        name: client.name,
        email: client.email,
        "metadata[launchset_client_id]": client.id,
      });
      customerId = customer.id;
      await environment.APP_DB.prepare(
        "UPDATE clients SET stripe_customer_id = ?, payment_updated_at = ?, updated_at = ? WHERE id = ?",
      ).bind(customerId, Date.now(), Date.now(), client.id).run();
    }

    const session = await stripeRequest<StripeCheckoutSession>(environment.STRIPE_SECRET_KEY, "/checkout/sessions", {
      mode: "subscription",
      ui_mode: "custom",
      customer: customerId,
      client_reference_id: client.id,
      return_url: `${origin}/account?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      "line_items[0][price_data][currency]": client.currency,
      "line_items[0][price_data][unit_amount]": client.monthly_fee_cents,
      "line_items[0][price_data][recurring][interval]": "month",
      "line_items[0][price_data][product_data][name]": "Launchset maintenance",
      "line_items[0][quantity]": 1,
      "metadata[launchset_client_id]": client.id,
      "subscription_data[metadata][launchset_client_id]": client.id,
      billing_address_collection: "auto",
      "customer_update[name]": "auto",
      "customer_update[address]": "auto",
    });
    if (!session.client_secret) throw new Error("Stripe did not return an embedded Checkout secret.");
    return Response.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Stripe Checkout creation failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "Stripe Checkout could not be opened." }, { status: 502 });
  }
}
