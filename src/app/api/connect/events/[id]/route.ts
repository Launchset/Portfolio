import { connectJson, connectRequestAccess } from "@/src/features/connect/http-access";
import { updateConnectEvent } from "@/src/features/connect/inbox";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await connectRequestAccess(request, true);
  if (!access) return connectJson({ error: "Not authorised." }, 403);
  const { id } = await params;
  const raw = await request.json().catch(() => null);
  const input = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as Record<string, unknown> : null;
  if (!/^[a-f0-9]{64}$/.test(id) || !input || typeof input.status !== "string" || !["new", "in_progress", "done"].includes(input.status)
    || typeof input.route_label !== "string" || !input.route_label.trim() || input.route_label.length > 100)
    return connectJson({ error: "Choose a status and routing label." }, 400);
  const result = await updateConnectEvent(access.environment.APP_DB, id, access.user.email, access.admin, input.status, input.route_label.trim());
  return result.meta.changes ? connectJson({ updated: true }) : connectJson({ error: "Event not found." }, 404);
}
