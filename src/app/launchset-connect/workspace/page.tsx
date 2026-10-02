import type { Metadata } from "next";
import { getPageUser, requestUserIsAdmin, getPortalEnvironment } from "@/src/features/portal/access";
import { redirect } from "next/navigation";
import { listConnectInbox } from "@/src/features/connect/inbox";
import type { ConnectEnvironment } from "@/src/features/connect/types";
import ConnectWorkspace from "@/src/features/connect/connect-workspace";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Connect workspace | Launchset", robots: { index: false, follow: false } };

export default async function ConnectWorkspacePage() {
  const user = await getPageUser();
  if (!user.emailVerified) redirect("/login");
  const admin = await requestUserIsAdmin(user);
  const environment = await getPortalEnvironment() as ConnectEnvironment;
  const inbox = await listConnectInbox(environment.APP_DB, user.email, admin);
  return <ConnectWorkspace initial={{ ...inbox, admin, configuration: admin ? {
    metaReady: Boolean(environment.CONNECT_META_APP_SECRET && environment.CONNECT_META_VERIFY_TOKEN),
    telegramReady: Boolean(environment.CONNECT_TELEGRAM_BOT_TOKEN),
    accountAccessReady: Boolean(environment.CONNECT_META_ACCESS_TOKEN && environment.CONNECT_META_GRAPH_API_VERSION),
  } : null }} email={user.email} />;
}
