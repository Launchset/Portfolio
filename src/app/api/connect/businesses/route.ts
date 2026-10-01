import { connectJson, connectRequestAccess } from "@/src/features/connect/http-access";
import { parseBusinessSettings, saveBusinessSettings } from "@/src/features/connect/business-settings";
import { readWebhookBody } from "@/src/platform/meta/whatsapp-webhook";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const access = await connectRequestAccess(request, true);
  if (!access?.admin) return connectJson({ error: "Not authorised." }, 403);
  const raw = await readWebhookBody(request);
  if (!raw || raw.length > 16000) return connectJson({ error: "Request too large." }, 413);
  let input;
  try { input = JSON.parse(new TextDecoder().decode(raw)); }
  catch { return connectJson({ error: "Invalid request." }, 400); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return connectJson({ error: "Invalid request." }, 400);
  try {
    const settings = parseBusinessSettings(input);
    if (settings.enabled && (!access.environment.CONNECT_META_APP_SECRET || !access.environment.CONNECT_META_VERIFY_TOKEN))
      return connectJson({ error: "Set the Meta webhook secrets before enabling this connection." }, 409);
    if (settings.enabled && settings.telegram_chat_id && !access.environment.CONNECT_TELEGRAM_BOT_TOKEN)
      return connectJson({ error: "Set the Telegram bot secret before enabling Telegram alerts." }, 409);
    const id = await saveBusinessSettings(access.environment.APP_DB, settings);
    return connectJson({ id });
  } catch (error) {
    // Only known validation errors are returned; database or provider details stay private.
    const messages = ["Enter ", "Keep ", "Invalid business ID.", "Business not found.", "This phone number ID is already connected.", "Remove this connection", "Check Meta account access"];
    const message = error instanceof Error ? error.message : "";
    return connectJson({ error: messages.some((prefix) => message.startsWith(prefix)) ? message : "The connection could not be saved." }, 400);
  }
}

export async function DELETE(request: Request) {
  const access = await connectRequestAccess(request, true);
  if (!access?.admin) return connectJson({ error: "Not authorised." }, 403);
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!/^[a-f0-9-]{36}$/.test(id)) return connectJson({ error: "Invalid business ID." }, 400);
  await access.environment.APP_DB.prepare("DELETE FROM connect_businesses WHERE id = ?").bind(id).run();
  return connectJson({ removed: true });
}
