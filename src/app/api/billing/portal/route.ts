import { getClientAccess, getPortalEnvironment, getRequestUser } from "@/src/features/portal/access";
import { stripeRequest } from "@/src/platform/stripe/stripe";

type PortalClient = { stripe_customer_id: string | null; stripe_subscription_id: string | null };
type StripePortalSession = { url: string };

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
    "SELECT stripe_customer_id, stripe_subscription_id FROM clients WHERE id = ?",
  ).bind(access.id).first<PortalClient>();
  if (!client?.stripe_customer_id) return Response.json({ error: "Complete payment setup first." }, { status: 409 });
  if (!client.stripe_subscription_id) return Response.json({ error: "There is no subscription to cancel." }, { status: 409 });

  try {
    if (environment.STRIPE_PORTAL_CONFIGURATION_ID) {
      await stripeRequest(environment.STRIPE_SECRET_KEY, `/billing_portal/configurations/${encodeURIComponent(environment.STRIPE_PORTAL_CONFIGURATION_ID)}`, {
        "features[subscription_cancel][enabled]": true,
        "features[subscription_cancel][mode]": "at_period_end",
        "features[subscription_cancel][proration_behavior]": "none",
      });
    }
    const session = await stripeRequest<StripePortalSession>(environment.STRIPE_SECRET_KEY, "/billing_portal/sessions", {
      customer: client.stripe_customer_id,
      return_url: `${origin}/account`,
      configuration: environment.STRIPE_PORTAL_CONFIGURATION_ID,
      "flow_data[type]": "subscription_cancel",
      "flow_data[subscription_cancel][subscription]": client.stripe_subscription_id,
      "flow_data[after_completion][type]": "redirect",
      "flow_data[after_completion][redirect][return_url]": `${origin}/account?billing=cancellation-scheduled`,
    });
    return Response.redirect(session.url, 303);
  } catch (error) {
    console.error("Stripe portal creation failed", error);
    return Response.json({ error: error instanceof Error ? error.message : "Stripe billing could not be opened." }, { status: 502 });
  }
}
