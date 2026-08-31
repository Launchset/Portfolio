import { NextRequest } from "next/server";
import { decodeSignatureDataUrl, stampSignature } from "@/src/lib/contracts";
import { clientStatusAllowsAccess, getPortalEnvironment, getRequestUser, normalizeEmail, sha256Hex } from "@/src/features/portal/access";

type SignableContractRow = {
  id: string;
  client_id: string;
  original_key: string;
  status: string;
  signature_page: number;
  signature_x: number;
  signature_y: number;
  signature_width: number;
  signature_height: number;
  client_email: string;
  client_status: string;
};

export const dynamic = "force-dynamic";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403 });
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_500_000) return Response.json({ error: "Signature image is too large." }, { status: 413 });

  const user = await getRequestUser(request);
  if (!user?.emailVerified) return Response.json({ error: "A verified sign-in is required." }, { status: 401 });

  const { id } = await context.params;
  const { APP_DB, CONTRACTS } = await getPortalEnvironment();
  const contract = await APP_DB.prepare(
    `SELECT contracts.*, clients.email AS client_email, clients.status AS client_status
     FROM contracts JOIN clients ON clients.id = contracts.client_id
     WHERE contracts.id = ?`,
  ).bind(id).first<SignableContractRow>();

  if (!contract || !clientStatusAllowsAccess(contract.client_status) || normalizeEmail(contract.client_email) !== normalizeEmail(user.email)) {
    return Response.json({ error: "Contract not found." }, { status: 404 });
  }
  if (contract.status !== "awaiting_signature") {
    return Response.json({ error: "This contract has already been signed or withdrawn." }, { status: 409 });
  }

  let payload: { signature?: string; signerName?: string; agreed?: boolean };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid signing request." }, { status: 400 });
  }

  const signerName = payload.signerName?.trim() ?? "";
  if (!payload.agreed || signerName.length < 2 || signerName.length > 120 || !payload.signature) {
    return Response.json({ error: "Draw your signature, enter your name, and accept the agreement." }, { status: 400 });
  }

  try {
    const signature = decodeSignatureDataUrl(payload.signature);
    const original = await CONTRACTS.get(contract.original_key);
    if (!original) return Response.json({ error: "The original contract file is unavailable." }, { status: 500 });

    const signedPdf = await stampSignature(await original.arrayBuffer(), signature, {
      page: contract.signature_page,
      x: contract.signature_x,
      y: contract.signature_y,
      width: contract.signature_width,
      height: contract.signature_height,
    });
    const signedKey = `clients/${contract.client_id}/contracts/${contract.id}/signed.pdf`;
    const signedHash = await sha256Hex(signedPdf);
    const signedAt = Date.now();

    await CONTRACTS.put(signedKey, signedPdf, {
      httpMetadata: { contentType: "application/pdf" },
      customMetadata: { contractId: contract.id, signedBy: user.id, signedAt: String(signedAt) },
    });

    const update = await APP_DB.prepare(
      `UPDATE contracts SET signed_key = ?, signed_sha256 = ?, status = 'signed', signer_name = ?,
       signer_email = ?, signed_by_user_id = ?, signed_at = ?, signature_ip = ?, signature_user_agent = ?, updated_at = ?
       WHERE id = ? AND status = 'awaiting_signature'`,
    ).bind(
      signedKey,
      signedHash,
      signerName,
      normalizeEmail(user.email),
      user.id,
      signedAt,
      request.headers.get("cf-connecting-ip"),
      request.headers.get("user-agent")?.slice(0, 500),
      signedAt,
      contract.id,
    ).run();

    if ((update.meta.changes ?? 0) !== 1) {
      await CONTRACTS.delete(signedKey);
      return Response.json({ error: "This contract was signed in another session." }, { status: 409 });
    }

    await APP_DB.prepare(
      "UPDATE clients SET status = 'contract_signed', updated_at = ? WHERE id = ? AND status = 'invited'",
    ).bind(signedAt, contract.client_id).run();

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contract signing failed", error);
    const message = error instanceof Error ? error.message : "We could not sign this contract.";
    return Response.json({ error: message }, { status: 400 });
  }
}
