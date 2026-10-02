import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ConnectEnvironment } from "@/src/features/connect/types";
import { dispatchConnectAlerts, receiveWhatsAppEvents } from "@/src/features/connect/inbox";
import { readWebhookBody, verifyWhatsAppSignature } from "@/src/platform/meta/whatsapp-webhook";
import { dispatchBackendMessages } from "@/src/features/connect/message-workflows";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const environment = env as unknown as ConnectEnvironment;
  const query = new URL(request.url).searchParams;
  const token = environment.CONNECT_META_VERIFY_TOKEN;
  if (!token) return new Response("Webhook not configured", { status: 503 });
  if (query.get("hub.mode") !== "subscribe" || query.get("hub.verify_token") !== token || !query.get("hub.challenge"))
    return new Response("Invalid verification", { status: 403 });
  return new Response(query.get("hub.challenge"), { headers: { "Cache-Control": "no-store", "Content-Type": "text/plain" } });
}

export async function POST(request: Request) {
  const { env, ctx } = await getCloudflareContext({ async: true });
  const environment = env as unknown as ConnectEnvironment;
  if (!environment.CONNECT_META_APP_SECRET) return new Response("Webhook not configured", { status: 503 });
  const raw = await readWebhookBody(request);
  if (!raw) return new Response("Request too large", { status: 413 });
  if (!await verifyWhatsAppSignature(raw, request.headers.get("x-hub-signature-256"), environment.CONNECT_META_APP_SECRET))
    return new Response("Invalid signature", { status: 401 });
  let payload;
  try { payload = JSON.parse(new TextDecoder().decode(raw)); }
  catch { return new Response("Invalid JSON", { status: 400 }); }
  try {
    await receiveWhatsAppEvents(environment, payload);
    ctx.waitUntil(dispatchConnectAlerts(environment).catch(() => { /* Durable outbox is recovered by the scheduled worker. */ }));
    ctx.waitUntil(dispatchBackendMessages(environment).catch(() => { /* Durable backend deliveries are recovered by the scheduled worker. */ }));
    return new Response("EVENT_RECEIVED", { headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response("Intake temporarily unavailable", { status: 503 });
  }
}
