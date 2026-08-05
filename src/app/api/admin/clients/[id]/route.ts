import { getPortalEnvironment, getRequestUser, requestUserIsAdmin } from "@/src/lib/portal";

type RemovableClient = {
  stripe_subscription_status: string | null;
};

const protectedSubscriptionStatuses = new Set(["active", "trialing", "past_due", "unpaid", "paused"]);

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user || !await requestUserIsAdmin(user)) return Response.json({ error: "Not found." }, { status: 404 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });

  const { id } = await params;
  const { APP_DB } = await getPortalEnvironment();
  const client = await APP_DB.prepare(
    "SELECT stripe_subscription_status FROM clients WHERE id = ? AND archived_at IS NULL",
  ).bind(id).first<RemovableClient>();
  if (!client) return Response.json({ error: "Client not found." }, { status: 404 });
  if (protectedSubscriptionStatuses.has(client.stripe_subscription_status ?? "")) {
    return Response.json({ error: "Cancel this client’s Stripe subscription before removing them." }, { status: 409 });
  }

  const now = Date.now();
  const result = await APP_DB.prepare(
    "UPDATE clients SET archived_at = ?, updated_at = ? WHERE id = ? AND archived_at IS NULL",
  ).bind(now, now, id).run();
  if ((result.meta.changes ?? 0) === 0) return Response.json({ error: "Client not found." }, { status: 404 });
  return Response.json({ ok: true });
}
