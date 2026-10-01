import type { BackendTarget } from "../../features/connect/workflow-settings";

export async function signBackendBody(secret: string, timestamp: string, body: Uint8Array) {
  const encoder = new TextEncoder();
  const prefix = encoder.encode(`${timestamp}.`);
  const signed = new Uint8Array(prefix.length + body.length); signed.set(prefix); signed.set(body, prefix.length);
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, signed)), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sendBackendMessage(target: BackendTarget, eventId: string, envelope: Record<string, unknown>) {
  const body = new TextEncoder().encode(JSON.stringify(envelope));
  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = await signBackendBody(target.secret, timestamp, body);
  const response = await fetch(target.url, { method: "POST", redirect: "error", signal: AbortSignal.timeout(15000), body,
    headers: { "Content-Type": "application/json", "X-Launchset-Timestamp": timestamp, "X-Launchset-Signature": `sha256=${signature}`,
      "Idempotency-Key": eventId } });
  if (!response.ok) throw new Error("backend_rejected");
}

export function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(binary);
}
