import { getCloudflareContext } from "@opennextjs/cloudflare";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { createAuth, getAdminEmail, isLaunchsetAdmin } from "./auth";
import type { StripeEnvironment } from "./stripe";

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
  ).bind(normalizeEmail(email)).first<PortalClientAccess>();

  return client && clientStatusAllowsAccess(client.status) ? client : null;
}

export async function requirePageClient() {
  const user = await getPageUser();
  if (!user.emailVerified || !await getClientAccess(user.email)) redirect("/access-required");
  return user;
}

export async function requirePageAdmin() {
  const user = await getPageUser();
  if (!user.emailVerified || !isLaunchsetAdmin(user.email, await getAdminEmail())) notFound();
  return user;
}

export async function getRequestUser(request: Request) {
  const auth = await createAuth(request);
  const session = await auth.api.getSession({ headers: request.headers });
  return (session?.user as PortalUser | undefined) ?? null;
}

export async function requestUserIsAdmin(user: PortalUser) {
  return user.emailVerified && isLaunchsetAdmin(user.email, await getAdminEmail());
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function formatMoney(cents: number, currency = "gbp") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export async function sha256Hex(value: ArrayBuffer | Uint8Array) {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
