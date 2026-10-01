import type { ConnectEnvironment } from "../../features/connect/types";

export class MessageActionError extends Error {
  constructor(public code: string, public uncertain = false) { super(code); }
}

function metaConfiguration(environment: ConnectEnvironment) {
  if (!environment.CONNECT_META_ACCESS_TOKEN || !/^v\d{1,2}\.\d$/.test(environment.CONNECT_META_GRAPH_API_VERSION || ""))
    throw new MessageActionError("meta_not_configured");
  return { base: `https://graph.facebook.com/${environment.CONNECT_META_GRAPH_API_VERSION}`,
    headers: { Authorization: `Bearer ${environment.CONNECT_META_ACCESS_TOKEN}` } };
}

export async function sendWhatsAppText(environment: ConnectEnvironment, phoneNumberId: string, sender: string, text: string) {
  const meta = metaConfiguration(environment);
  let response;
  try {
    response = await fetch(`${meta.base}/${phoneNumberId}/messages`, { method: "POST", redirect: "manual",
      headers: { ...meta.headers, "Content-Type": "application/json" }, signal: AbortSignal.timeout(10000),
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to: sender, type: "text", text: { preview_url: false, body: text } }) });
  } catch { throw new MessageActionError("send_outcome_unknown", true); }
  if (!response.ok) throw new MessageActionError("meta_send_rejected", response.status >= 500);
  const body = await response.json().catch(() => null) as { messages?: Array<{ id?: string }> } | null;
  const id = body?.messages?.[0]?.id;
  if (typeof id !== "string" || !id || id.length > 512) throw new MessageActionError("send_outcome_unknown", true);
  return id;
}

// Initial document workflow supports PDF, text and common Office files up to 10 MiB.
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
const documentTypes = new Set(["application/pdf", "text/plain", "application/msword", "application/vnd.ms-excel", "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"]);

export async function downloadWhatsAppDocument(environment: ConnectEnvironment, phoneNumberId: string, mediaId: string) {
  if (!/^\d{1,40}$/.test(mediaId) || !/^\d{1,40}$/.test(phoneNumberId)) throw new MessageActionError("invalid_media");
  const meta = metaConfiguration(environment);
  let metadata;
  try {
    const response = await fetch(`${meta.base}/${mediaId}?phone_number_id=${phoneNumberId}`, {
      headers: meta.headers, signal: AbortSignal.timeout(10000), redirect: "manual" });
    if (!response.ok) throw new Error();
    metadata = await response.json() as { url?: string; mime_type?: string; file_size?: number; sha256?: string };
  } catch { throw new MessageActionError("media_lookup_failed"); }
  if (!metadata?.mime_type || !documentTypes.has(metadata.mime_type)) throw new MessageActionError("unsupported_document");
  if (!Number.isSafeInteger(metadata.file_size) || metadata.file_size! < 0 || metadata.file_size! > MAX_DOCUMENT_BYTES)
    throw new MessageActionError("document_too_large");
  let url;
  try { url = new URL(metadata.url || ""); } catch { throw new MessageActionError("invalid_media_url"); }
  // Bearer tokens never follow arbitrary download URLs or redirects.
  if (url.protocol !== "https:" || url.username || url.password || url.port
    || !(url.hostname === "lookaside.fbsbx.com" || url.hostname.endsWith(".fbcdn.net"))) throw new MessageActionError("invalid_media_url");
  let response;
  try { response = await fetch(url, { headers: meta.headers, signal: AbortSignal.timeout(15000), redirect: "manual" }); }
  catch { throw new MessageActionError("media_download_failed"); }
  if (!response.ok || !response.body) throw new MessageActionError("media_download_failed");
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let length = 0;
  while (true) {
    let item;
    try { item = await reader.read(); } catch { throw new MessageActionError("media_download_failed"); }
    if (item.done) break;
    length += item.value.length;
    if (length > MAX_DOCUMENT_BYTES) { await reader.cancel(); throw new MessageActionError("document_too_large"); }
    chunks.push(item.value);
  }
  if (length !== metadata.file_size) throw new MessageActionError("document_size_mismatch");
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  const hex = Array.from(hash, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const base64 = btoa(String.fromCharCode(...hash));
  if (metadata.sha256 && metadata.sha256 !== hex && metadata.sha256 !== base64) throw new MessageActionError("document_hash_mismatch");
  return { bytes, mimeType: metadata.mime_type, sha256: hex };
}
