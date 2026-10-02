import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { ConnectEnvironment } from "@/src/features/connect/types";
import { receiveBackendReply } from "@/src/features/connect/backend-replies";
import { connectJson } from "@/src/features/connect/http-access";
import { readWebhookBody } from "@/src/platform/meta/whatsapp-webhook";
import { MessageActionError } from "@/src/platform/meta/message-actions";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const raw = await readWebhookBody(request);
  if (!raw || raw.length > 24000) return connectJson({ error: "Request too large." }, 413);
  const { env } = await getCloudflareContext({ async: true });
  try {
    const reply = await receiveBackendReply(env as unknown as ConnectEnvironment, key, raw,
      request.headers.get("x-launchset-timestamp"), request.headers.get("x-launchset-signature"));
    return connectJson(reply, reply.status === "accepted" ? 200 : reply.status === "processing" ? 202 : 409);
  } catch (error) {
    const code = error instanceof MessageActionError ? error.code : "reply_unavailable";
    return connectJson({ error: code }, code === "backend_not_authorised" ? 403 : code === "reply_unavailable" ? 503 : 409);
  }
}
