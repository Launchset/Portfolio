export async function verifyBackendRequest(secret: string, timestamp: string | null, signature: string | null, body: Uint8Array, now = Date.now()) {
  if (!secret || !timestamp || !/^\d{10,12}$/.test(timestamp) || Math.abs(now - Number(timestamp) * 1000) > 300000
    || !signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  const encoder = new TextEncoder(); const prefix = encoder.encode(`${timestamp}.`);
  const signed = new Uint8Array(prefix.length + body.length); signed.set(prefix); signed.set(body, prefix.length);
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const bytes = Uint8Array.from(signature.slice(7).match(/../g)!, (pair) => parseInt(pair, 16));
  return crypto.subtle.verify("HMAC", key, bytes, signed);
}
