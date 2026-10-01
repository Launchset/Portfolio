import type { ConnectBusiness, ConnectEnvironment } from "./types";
import { matchRoutingLabel, targetRevision, workflowConfiguration } from "./workflow-settings";
import { extractMessageContent, type IncomingContent } from "../../platform/meta/message-content";
import { downloadWhatsAppDocument, MessageActionError, sendWhatsAppText } from "../../platform/meta/message-actions";
import { bytesToBase64, sendBackendMessage } from "../../platform/notifications/backend-message";

export async function messageIntakeStatements(environment: ConnectEnvironment, business: ConnectBusiness, payload: unknown,
  messageId: string, messageType: string, eventId: string, nonce: string, now: number) {
  const configuration = workflowConfiguration(environment);
  const workflow = configuration?.workflows.find((item) => item.businessId === business.id && item.phoneNumberId === business.phone_number_id);
  if (!workflow) return [];
  const content = extractMessageContent(payload, business.waba_id, business.phone_number_id, now).get(messageId);
  if (!content) return [];
  const label = matchRoutingLabel(workflow, content.senderId, messageType, content.text, business.route_label);
  const key = workflow.destinations[label];
  const target = ["text", "document"].includes(messageType)
    ? configuration!.targets.find((item) => item.key === key && item.businessId === business.id) : undefined;
  const revision = target ? await targetRevision(target) : null;
  const db = environment.APP_DB;
  const alerts = workflow.alerts?.[label];
  const labelStatement = db.prepare("UPDATE connect_events SET route_label=?,email_to=?,telegram_chat_id=? WHERE id=? AND intake_nonce=?")
    .bind(label, alerts?.emailTo ?? business.email_to, alerts?.telegramChatId ?? business.telegram_chat_id, eventId, nonce);
  // Tubudd alert-only routes need no retained customer content or conversation store.
  if (!target) return [labelStatement];
  // All statements join on this request's event nonce: replay cannot capture content or add a destination.
  const statements = [db.prepare(`INSERT OR IGNORE INTO connect_messages
    (event_id,sender_id,sent_at,text,document_json,routed_label,target_key,target_revision)
    SELECT id,?,?,?,?,?,?,? FROM connect_events WHERE id = ? AND intake_nonce = ?`)
    .bind(content.senderId, content.sentAt, content.text, content.document ? JSON.stringify(content.document) : null, label,
      target?.key || null, revision, eventId, nonce),
  labelStatement];
  if (target) statements.push(db.prepare(`INSERT OR IGNORE INTO connect_backend_deliveries (event_id,next_attempt_at)
    SELECT id,received_at FROM connect_events WHERE id = ? AND intake_nonce = ?`).bind(eventId, nonce));
  return statements;
}

type StoredMessage = { event_id: string; sender_id: string; sent_at: number; text: string; document_json: string | null;
  routed_label: string; target_key: string | null; target_revision: string | null; business_id: string; phone_number_id: string; message_type: string; enabled: number };

export async function getConnectMessage(db: D1Database, eventId: string, email: string, admin: boolean) {
  return db.prepare(`SELECT m.*,e.business_id,e.message_type,b.phone_number_id,b.enabled FROM connect_messages m
    JOIN connect_events e ON e.id=m.event_id JOIN connect_businesses b ON b.id=e.business_id
    WHERE m.event_id=? AND (?=1 OR b.member_email=? COLLATE NOCASE)`)
    .bind(eventId, Number(admin), email).first<StoredMessage>();
}

export async function dispatchBackendMessages(environment: ConnectEnvironment, now = Date.now()) {
  const db = environment.APP_DB;
  const jobs = await db.prepare(`SELECT d.event_id,d.attempts FROM connect_backend_deliveries d
    JOIN connect_events e ON e.id=d.event_id JOIN connect_businesses b ON b.id=e.business_id
    WHERE b.enabled=1 AND ((d.status='pending' AND d.next_attempt_at<=?) OR (d.status='processing' AND d.claimed_at<=?))
    ORDER BY d.next_attempt_at LIMIT 10`).bind(now, now - 120000).all<{ event_id: string; attempts: number }>();
  for (const job of jobs.results) {
    const claim = crypto.randomUUID();
    const claimed = await db.prepare(`UPDATE connect_backend_deliveries SET status='processing',claim_token=?,claimed_at=?,attempts=attempts+1
      WHERE event_id=? AND ((status='pending' AND next_attempt_at<=?) OR (status='processing' AND claimed_at<=?))
      AND EXISTS(SELECT 1 FROM connect_events e JOIN connect_businesses b ON b.id=e.business_id WHERE e.id=event_id AND b.enabled=1)`)
      .bind(claim, now, job.event_id, now, now - 120000).run();
    if (!claimed.meta.changes) continue;
    let permanent = false;
    try {
      const message = await getConnectMessage(db, job.event_id, "", true);
      const configuration = workflowConfiguration(environment);
      const target = configuration?.targets.find((item) => item.key === message?.target_key && item.businessId === message?.business_id);
      if (!message || !configuration?.workflows.some((item) => item.businessId === message.business_id && item.phoneNumberId === message.phone_number_id)
        || !target || message.target_revision !== await targetRevision(target)) {
        permanent = true; throw new MessageActionError("routing_configuration_changed");
      }
      const document = message.document_json ? JSON.parse(message.document_json) as IncomingContent["document"] : null;
      let attachment = null;
      if (document) {
        const file = await downloadWhatsAppDocument(environment, message.phone_number_id, document.id);
        attachment = { filename: document.filename, mime_type: file.mimeType, sha256: file.sha256, base64: bytesToBase64(file.bytes) };
      }
      await sendBackendMessage(target, message.event_id, { version: 1, event_id: message.event_id, business_id: message.business_id,
        phone_number_id: message.phone_number_id, sender_id: message.sender_id, sent_at: message.sent_at,
        type: message.message_type, label: message.routed_label, text: message.text, document: attachment });
      await db.prepare("UPDATE connect_backend_deliveries SET status='sent',sent_at=?,error_code=NULL WHERE event_id=? AND claim_token=?")
        .bind(Date.now(), job.event_id, claim).run();
    } catch (error) {
      const attempt = job.attempts + 1;
      const code = error instanceof MessageActionError ? error.code : "backend_delivery_failed";
      await db.prepare("UPDATE connect_backend_deliveries SET status=?,next_attempt_at=?,error_code=?,claim_token=NULL WHERE event_id=? AND claim_token=?")
        .bind(permanent || attempt >= 8 ? "failed" : "pending", now + Math.min(3600000, 30000 * 2 ** (attempt - 1)), code, job.event_id, claim).run();
    }
  }
}

export async function replyToConnectMessage(environment: ConnectEnvironment, eventId: string, email: string, admin: boolean,
  requestId: string, text: string, now = Date.now()) {
  if (!/^[a-f0-9-]{36}$/.test(requestId) || !text.trim() || text.length > 4096) throw new MessageActionError("invalid_reply");
  const message = await getConnectMessage(environment.APP_DB, eventId, email, admin);
  if (!message) throw new MessageActionError("message_not_found");
  const db = environment.APP_DB;
  const previous = await db.prepare("SELECT id,event_id,text,status,provider_message_id,created_at FROM connect_replies WHERE id=?").bind(requestId)
    .first<{ event_id: string; text: string; status: string; provider_message_id: string | null; created_at: number }>();
  if (previous) {
    if (previous.event_id !== eventId || previous.text !== text) throw new MessageActionError("reply_id_conflict");
    // A stale processing record means the Worker might have sent before it stopped. Never send twice automatically.
    if (previous.status === "processing" && previous.created_at < now - 120000)
      await db.prepare("UPDATE connect_replies SET status='unknown' WHERE id=? AND status='processing'").bind(requestId).run();
    return { status: previous.status === "processing" && previous.created_at < now - 120000 ? "unknown" : previous.status,
      provider_message_id: previous.provider_message_id };
  }
  const config = workflowConfiguration(environment);
  if (!message.enabled || !config?.workflows.some((item) => item.businessId === message.business_id && item.phoneNumberId === message.phone_number_id))
    throw new MessageActionError("message_workflow_disabled");
  // Use signed provider time, never webhook receipt time. A delayed/replayed message cannot extend the window.
  const latest = await db.prepare(`SELECT MAX(m.sent_at) AS sent_at FROM connect_messages m JOIN connect_events e ON e.id=m.event_id
    WHERE e.business_id=? AND m.sender_id=?`).bind(message.business_id, message.sender_id).first<{ sent_at: number }>();
  if (!latest || latest.sent_at > now || now - latest.sent_at >= 86400000) throw new MessageActionError("reply_window_closed");
  const inserted = await db.prepare("INSERT OR IGNORE INTO connect_replies(id,event_id,text,status,created_at) VALUES(?,?,?,'processing',?)")
    .bind(requestId, eventId, text, now).run();
  if (!inserted.meta.changes) return replyToConnectMessage(environment, eventId, email, admin, requestId, text, now);
  try {
    const id = await sendWhatsAppText(environment, message.phone_number_id, message.sender_id, text);
    await db.prepare("UPDATE connect_replies SET status='accepted',provider_message_id=? WHERE id=? AND status='processing'").bind(id, requestId).run();
    return { status: "accepted", provider_message_id: id };
  } catch (error) {
    const uncertain = error instanceof MessageActionError ? error.uncertain : true;
    await db.prepare("UPDATE connect_replies SET status=? WHERE id=? AND status='processing'").bind(uncertain ? "unknown" : "rejected", requestId).run();
    return { status: uncertain ? "unknown" : "rejected", provider_message_id: null };
  }
}
