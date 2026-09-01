import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createAuth, getAdminEmail, isLaunchsetAdmin } from "@/src/lib/auth";
import type { StripeEnvironment } from "@/src/platform/stripe/stripe";
import { normalizeEmail } from "./email";

export { formatMoney } from "@/src/shared/format/money";
export { sha256Hex } from "@/src/shared/security/digests";
export { normalizeEmail } from "./email";

export type PortalEnvironment = CloudflareEnv & {
  APP_DB: D1Database;
  CONTRACTS: R2Bucket;
} & StripeEnvironment;

export type PortalUser = {
  id: string;
  name?: string | null;
  image?: string | null;
  email: string;
  emailVerified: boolean;
};

export type PortalClientAccess = {
  id: string;
  status: string;
};

const clientAccessStatuses = new Set(["invited", "contract_signed", "active"]);

export async function getPortalEnvironment() {
  const { env } = await getCloudflareContext({ async: true });
  return env as PortalEnvironment;
}

export async function getPageUser() {
  const auth = await createAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  return session.user as PortalUser;
}

export function clientStatusAllowsAccess(status: string) {
  return clientAccessStatuses.has(status);
}

export async function getClientAccess(email: string) {
  const { APP_DB } = await getPortalEnvironment();
  const client = await APP_DB.prepare(
    "SELECT id, status FROM clients WHERE email = ? AND archived_at IS NULL",
  )
    .bind(normalizeEmail(email))
    .first<PortalClientAccess>();

  return client && clientStatusAllowsAccess(client.status) ? client : null;
}

export async function requirePageClient() {
  return (await requirePageClientContext()).user;
}

export async function requirePageClientContext() {
  const user = await getPageUser();
  const access = user.emailVerified ? await getClientAccess(user.email) : null;
  if (!access) redirect("/access-required");
  return { access, user };
}

export async function requirePageAdmin() {
  const user = await getPageUser();
  if (
    !user.emailVerified ||
    !isLaunchsetAdmin(user.email, await getAdminEmail())
  )
    notFound();
  return user;
}

export async function getRequestUser(request: Request) {
  const auth = await createAuth(request);
  const session = await auth.api.getSession({ headers: request.headers });
  return (session?.user as PortalUser | undefined) ?? null;
}

export async function requestUserIsAdmin(user: PortalUser) {
  return (
    user.emailVerified && isLaunchsetAdmin(user.email, await getAdminEmail())
  );
}
