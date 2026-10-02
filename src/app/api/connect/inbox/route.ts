import { connectJson, connectRequestAccess } from "@/src/features/connect/http-access";
import { listConnectInbox } from "@/src/features/connect/inbox";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await connectRequestAccess(request);
  if (!access) return connectJson({ error: "Sign in with a verified email to open Connect." }, 401);
  const inbox = await listConnectInbox(access.environment.APP_DB, access.user.email, access.admin);
  return connectJson({ ...inbox, admin: access.admin, configuration: access.admin ? {
    metaReady: Boolean(access.environment.CONNECT_META_APP_SECRET && access.environment.CONNECT_META_VERIFY_TOKEN),
    telegramReady: Boolean(access.environment.CONNECT_TELEGRAM_BOT_TOKEN),
    accountAccessReady: Boolean(access.environment.CONNECT_META_ACCESS_TOKEN && access.environment.CONNECT_META_GRAPH_API_VERSION),
  } : null });
}
