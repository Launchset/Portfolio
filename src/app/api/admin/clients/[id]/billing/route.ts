import { getPortalEnvironment, getRequestUser, requestUserIsAdmin } from "@/src/lib/portal";
import { stripeRequest, subscriptionPeriodEnd } from "@/src/lib/stripe";

type BillingClient = {
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  stripe_cancel_at_period_end: number;
};

type StripeSubscription = Record<string, unknown> & {
  status?: string;
  pause_collection?: Record<string, unknown> | null;
  cancel_at_period_end?: boolean;
};

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user || !await requestUserIsAdmin(user)) return Response.json({ error: "Not found." }, { status: 404 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });

  const body = await request.json().catch(() => null) as { action?: unknown } | null;
  if (body?.action !== "freeze" && body?.action !== "unfreeze" && body?.action !== "cancel") return Response.json({ error: "Choose freeze, unfreeze, or cancel." }, { status: 400 });

  const { id } = await params;
  const environment = await getPortalEnvironment();
  if (!environment.STRIPE_SECRET_KEY) return Response.json({ error: "Stripe is not configured." }, { status: 503 });
  const client = await environment.APP_DB.prepare(
    `SELECT stripe_subscription_id, stripe_subscription_status, stripe_cancel_at_period_end
     FROM clients WHERE id = ? AND archived_at IS NULL`,
  ).bind(id).first<BillingClient>();
  if (!client?.stripe_subscription_id) return Response.json({ error: "This client does not have a Stripe subscription." }, { status: 409 });
  if (body.action === "cancel" && client.stripe_cancel_at_period_end) return Response.json({ ok: true, cancelling: true });
  if (client.stripe_cancel_at_period_end) return Response.json({ error: "This subscription is already scheduled to cancel." }, { status: 409 });
  if (body.action === "freeze" && client.stripe_subscription_status !== "active" && client.stripe_subscription_status !== "trialing") {
    return Response.json({ error: "Only an active subscription can be frozen." }, { status: 409 });
  }

  try {
    const subscription = await stripeRequest<StripeSubscription>(
      environment.STRIPE_SECRET_KEY,
      `/subscriptions/${encodeURIComponent(client.stripe_subscription_id)}`,
      body.action === "freeze"
        ? { "pause_collection[behavior]": "void" }
        : body.action === "unfreeze"
          ? { pause_collection: "" }
          : { cancel_at_period_end: true },
    );
    const now = Date.now();
    await environment.APP_DB.prepare(
      `UPDATE clients SET stripe_subscription_status = ?, stripe_collection_paused = ?,
       stripe_cancel_at_period_end = ?, stripe_current_period_end = ?, payment_updated_at = ?, updated_at = ?
       WHERE id = ?`,
    ).bind(
      typeof subscription.status === "string" ? subscription.status : client.stripe_subscription_status,
      subscription.pause_collection ? 1 : 0,
      subscription.cancel_at_period_end ? 1 : 0,
      subscriptionPeriodEnd(subscription),
      now,
      now,
      id,
    ).run();
    return Response.json({ ok: true, frozen: Boolean(subscription.pause_collection), cancelling: Boolean(subscription.cancel_at_period_end) });
  } catch (error) {
    console.error("Stripe subscription collection update failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "Stripe billing could not be updated." }, { status: 502 });
  }
}
