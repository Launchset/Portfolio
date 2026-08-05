import { PDFDocument } from "pdf-lib";
import { getPortalEnvironment, getRequestUser, normalizeEmail, requestUserIsAdmin, sha256Hex } from "@/src/lib/portal";

type EmailEnvironment = Awaited<ReturnType<typeof getPortalEnvironment>> & {
  AUTH_EMAIL: { send(message: { from: string; to: string; subject: string; text: string; html: string }): Promise<unknown> };
  AUTH_EMAIL_FROM: string;
  BETTER_AUTH_URL?: string;
};

export const dynamic = "force-dynamic";

function numberField(form: FormData, name: string, fallback: number) {
  const value = Number(form.get(name));
  return Number.isFinite(value) ? value : fallback;
}

export async function POST(request: Request) {
  const user = await getRequestUser(request);
  if (!user || !await requestUserIsAdmin(user)) return Response.json({ error: "Not found." }, { status: 404 });
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ error: "Invalid request origin." }, { status: 403 });

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const email = normalizeEmail(String(form.get("email") ?? ""));
  const title = String(form.get("title") ?? "Launchset service agreement").trim();
  const monthlyFee = Math.round(numberField(form, "monthlyFee", -1) * 100);
  const file = form.get("contract");

  if (name.length < 2 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) || title.length < 2 || monthlyFee < 0 || !(file instanceof File)) {
    return Response.json({ error: "Add the client details, monthly price, and PDF contract." }, { status: 400 });
  }
  if (file.size === 0 || file.size > 10 * 1024 * 1024 || file.type !== "application/pdf") {
    return Response.json({ error: "The contract must be a PDF no larger than 10 MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  let pageSizes: Array<{ width: number; height: number }>;
  try {
    const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
    pageSizes = pdf.getPages().map((page) => page.getSize());
  } catch {
    return Response.json({ error: "This PDF could not be read. Password-protected PDFs are not supported." }, { status: 400 });
  }

  const placement = {
    page: Math.trunc(numberField(form, "signaturePage", -1)),
    x: numberField(form, "signatureX", 54),
    y: numberField(form, "signatureY", 54),
    width: numberField(form, "signatureWidth", 180),
    height: numberField(form, "signatureHeight", 64),
  };
  const resolvedPage = placement.page < 0 ? pageSizes.length - 1 : placement.page;
  const selectedPage = pageSizes[resolvedPage];
  if (!selectedPage || placement.x < 0 || placement.y < 0 || placement.width <= 0 || placement.height <= 0 || placement.x + placement.width > selectedPage.width || placement.y + placement.height > selectedPage.height) {
    return Response.json({ error: "The signature placement is outside the selected PDF page." }, { status: 400 });
  }

  const environment = await getPortalEnvironment() as EmailEnvironment;
  const { APP_DB, CONTRACTS } = environment;
  const existing = await APP_DB.prepare("SELECT id FROM clients WHERE email = ?").bind(email).first();
  if (existing) return Response.json({ error: "A client with this email already exists." }, { status: 409 });

  const clientId = crypto.randomUUID();
  const contractId = crypto.randomUUID();
  const now = Date.now();
  const originalKey = `clients/${clientId}/contracts/${contractId}/original.pdf`;

  await CONTRACTS.put(originalKey, bytes, {
    httpMetadata: { contentType: "application/pdf" },
    customMetadata: { clientId, contractId, uploadedBy: user.id },
  });

  try {
    await APP_DB.batch([
      APP_DB.prepare(
        "INSERT INTO clients (id, name, email, monthly_fee_cents, currency, status, invited_at, created_at, updated_at) VALUES (?, ?, ?, ?, 'gbp', 'invited', ?, ?, ?)",
      ).bind(clientId, name, email, monthlyFee, now, now, now),
      APP_DB.prepare(
        `INSERT INTO contracts (id, client_id, title, original_key, original_sha256, status,
         signature_page, signature_x, signature_y, signature_width, signature_height, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'awaiting_signature', ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(contractId, clientId, title, originalKey, await sha256Hex(bytes), placement.page, placement.x, placement.y, placement.width, placement.height, now, now),
    ]);
  } catch (error) {
    await CONTRACTS.delete(originalKey);
    console.error("Client creation failed", error);
    return Response.json({ error: "The client could not be created." }, { status: 500 });
  }

  let emailWarning: string | undefined;
  try {
    const baseUrl = environment.BETTER_AUTH_URL ?? new URL(request.url).origin;
    const safeName = name.replace(/[<>&"']/g, "");
    const safeEmail = email.replace(/[<>&"']/g, "");
    await environment.AUTH_EMAIL.send({
      from: environment.AUTH_EMAIL_FROM,
      to: email,
      subject: "Your Launchset client portal is ready",
      text: `Hello ${name},\n\nLaunchset has prepared your client portal. Sign in using ${email} to review and sign your contract, then set up your maintenance payment.\n\n${baseUrl}/login\n`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#142019"><p style="font-size:12px;letter-spacing:.14em;color:#59742a">LAUNCHSET</p><h1>Your client portal is ready</h1><p>Hello ${safeName},</p><p>Sign in with <strong>${safeEmail}</strong> to review and sign your contract, then set up your maintenance payment.</p><p style="margin:28px 0"><a href="${baseUrl}/login" style="display:inline-block;padding:13px 18px;border-radius:9px;background:#102018;color:#fff;text-decoration:none;font-weight:700">Open Launchset</a></p></div>`,
    });
  } catch (error) {
    console.error("Client invitation email failed", error);
    emailWarning = "The client was created, but the invitation email was not delivered. You can resend it later.";
  }

  return Response.json({ ok: true, clientId, warning: emailWarning });
}
