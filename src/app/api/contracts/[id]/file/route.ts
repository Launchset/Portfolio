import { NextRequest } from "next/server";
import { clientStatusAllowsAccess, getPortalEnvironment, getRequestUser, normalizeEmail, requestUserIsAdmin } from "@/src/features/portal/access";

type ContractFileRow = {
  title: string;
  original_key: string;
  signed_key: string | null;
  client_email: string;
  client_status: string;
};

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(request);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await context.params;
  const { APP_DB, CONTRACTS } = await getPortalEnvironment();
  const contract = await APP_DB.prepare(
    `SELECT contracts.title, contracts.original_key, contracts.signed_key, clients.email AS client_email,
     clients.status AS client_status
     FROM contracts JOIN clients ON clients.id = contracts.client_id
     WHERE contracts.id = ?`,
  ).bind(id).first<ContractFileRow>();

  if (!contract) return new Response("Not found", { status: 404 });
  const authorized = (
    user.emailVerified
    && clientStatusAllowsAccess(contract.client_status)
    && normalizeEmail(user.email) === normalizeEmail(contract.client_email)
  ) || await requestUserIsAdmin(user);
  if (!authorized) return new Response("Not found", { status: 404 });

  const wantsOriginal = request.nextUrl.searchParams.get("version") === "original";
  const object = await CONTRACTS.get(wantsOriginal || !contract.signed_key ? contract.original_key : contract.signed_key);
  if (!object) return new Response("File not found", { status: 404 });

  const safeTitle = contract.title.replace(/[^a-zA-Z0-9._ -]/g, "").trim() || "Launchset contract";
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${safeTitle}.pdf"`);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}
