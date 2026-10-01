export type IncomingContent = {
  messageId: string; senderId: string; sentAt: number; text: string;
  document: { id: string; filename: string; mimeType: string; sha256: string } | null;
};

const object = (value: unknown): Record<string, unknown> | null => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
const text = (value: unknown, max: number) => typeof value === "string" && value.length <= max ? value : "";

export function extractMessageContent(payload: unknown, wabaId: string, phoneNumberId: string, now: number): Map<string, IncomingContent> {
  const result = new Map<string, IncomingContent>();
  const root = object(payload);
  if (root?.object !== "whatsapp_business_account" || !Array.isArray(root.entry)) return result;
  for (const entryValue of root.entry) {
    const entry = object(entryValue);
    if (entry?.id !== wabaId || !Array.isArray(entry.changes)) continue;
    for (const changeValue of entry.changes) {
      const change = object(changeValue); const value = object(change?.value);
      if (change?.field !== "messages" || object(value?.metadata)?.phone_number_id !== phoneNumberId || !Array.isArray(value?.messages)) continue;
      for (const messageValue of value.messages) {
        const message = object(messageValue);
        const messageId = text(message?.id, 512), senderId = text(message?.from, 128);
        const timestamp = text(message?.timestamp, 16);
        const sentAt = /^\d+$/.test(timestamp) ? Number(timestamp) * 1000 : 0;
        if (!messageId || !senderId || !Number.isSafeInteger(sentAt) || sentAt <= 0 || sentAt > now + 300000) continue;
        const document = message?.type === "document" ? object(message.document) : null;
        const mediaId = text(document?.id, 40);
        // Store only fields needed for reply/routing. Contact profiles and raw webhook are discarded.
        result.set(messageId, { messageId, senderId, sentAt,
          text: message?.type === "text" ? text(object(message.text)?.body, 4096) : text(document?.caption, 4096),
          document: /^\d+$/.test(mediaId) ? { id: mediaId, filename: text(document?.filename, 200) || "document",
            mimeType: text(document?.mime_type, 120), sha256: text(document?.sha256, 128) } : null });
      }
    }
  }
  return result;
}
