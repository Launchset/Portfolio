import { getCloudflareContext } from "@opennextjs/cloudflare";
import { connectJson, connectRequestAccess } from "@/src/features/connect/http-access";
import { dispatchConnectAlerts } from "@/src/features/connect/inbox";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await connectRequestAccess(request, true);
  if (!access) return connectJson({ error: "Not authorised." }, 403);
  const { id } = await params;
  const result = await access.environment.APP_DB.prepare(`UPDATE connect_deliveries SET status = 'pending', attempts = 0, next_attempt_at = ?, error_code = NULL
    WHERE event_id = ? AND status = 'failed' AND EXISTS (SELECT 1 FROM connect_events e JOIN connect_businesses b ON b.id = e.business_id
      WHERE e.id = event_id AND b.enabled = 1 AND (? = 1 OR b.member_email = ? COLLATE NOCASE))`)
    .bind(Date.now(), id, Number(access.admin), access.user.email).run();
  if (!result.meta.changes) return connectJson({ error: "No failed alerts are available to retry." }, 404);
  const { ctx } = await getCloudflareContext({ async: true });
  ctx.waitUntil(dispatchConnectAlerts(access.environment).catch(() => {}));
  return connectJson({ queued: true });
}
