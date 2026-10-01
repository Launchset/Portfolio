import { getPortalEnvironment, getRequestUser, requestUserIsAdmin } from "../portal/access";
import type { ConnectEnvironment } from "./types";

export async function connectRequestAccess(request: Request, mutation = false) {
  const user = await getRequestUser(request);
  if (!user?.emailVerified) return null;
  if (mutation && request.headers.get("origin") !== new URL(request.url).origin) return null;
  return { user, admin: await requestUserIsAdmin(user), environment: await getPortalEnvironment() as ConnectEnvironment };
}

export function connectJson(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "private, no-store" } });
}
