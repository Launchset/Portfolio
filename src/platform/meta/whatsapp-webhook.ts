const encoder = new TextEncoder();
export const MAX_WEBHOOK_BYTES = 256 * 1024;

export async function verifyWhatsAppSignature(body: Uint8Array, signature: string | null, secret: string) {
  if (!secret || !signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const bytes = Uint8Array.from(signature.slice(7).match(/../g)!, (pair) => parseInt(pair, 16));
  return crypto.subtle.verify("HMAC", key, bytes, body as BufferSource);
}

export async function readWebhookBody(request: Request) {
  if (Number(request.headers.get("content-length")) > MAX_WEBHOOK_BYTES) return null;
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_WEBHOOK_BYTES) { await reader.cancel(); return null; }
    chunks.push(value);
  }
  const result = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; }
  return result;
}

type IncomingMessage = { wabaId: string; phoneNumberId: string; messageId: string; messageType: string };

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function string(value: unknown, max: number) { return typeof value === "string" && value.length <= max ? value : ""; }

// Deliberately discard message text, contact names, customer identifiers and media.
export function extractWhatsAppEvents(payload: unknown): IncomingMessage[] {
  const root = record(payload);
  if (root?.object !== "whatsapp_business_account" || !Array.isArray(root.entry)) return [];
  const result: IncomingMessage[] = [];
  for (const item of root.entry) {
    const entry = record(item);
    const wabaId = string(entry?.id, 40);
    if (!/^\d+$/.test(wabaId) || !Array.isArray(entry?.changes)) continue;
    for (const item of entry.changes) {
      const change = record(item);
      if (change?.field !== "messages") continue;
      const value = record(change.value);
      const phoneNumberId = string(record(value?.metadata)?.phone_number_id, 40);
      if (!/^\d+$/.test(phoneNumberId) || !Array.isArray(value?.messages)) continue;
      for (const item of value.messages) {
        const message = record(item);
        const messageId = string(message?.id, 512);
        // A sender is checked transiently to distinguish customer messages from status events.
        if (!messageId || typeof message?.from !== "string" || !message.from) continue;
        const kind = string(message.type, 40);
        result.push({ wabaId, phoneNumberId, messageId, messageType: /^[a-z_]+$/.test(kind) ? kind : "other" });
      }
    }
  }
  return result;
}
