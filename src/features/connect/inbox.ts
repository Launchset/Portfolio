import type { ConnectBusiness, ConnectEnvironment, ConnectEvent } from "./types";
import { extractWhatsAppEvents } from "../../platform/meta/whatsapp-webhook";
import { AlertDeliveryError, sendGenericAlert } from "../../platform/notifications/generic-alert";
import { dispatchBackendMessages, messageIntakeStatements } from "./message-workflows";

export async function receiveWhatsAppEvents(environment: ConnectEnvironment, payload: unknown, now = Date.now()) {
  const db = environment.APP_DB;
  let accepted = 0;
  for (const incoming of extractWhatsAppEvents(payload)) {
    const business = await db.prepare("SELECT * FROM connect_businesses WHERE enabled = 1 AND waba_id = ? AND phone_number_id = ?")
      .bind(incoming.wabaId, incoming.phoneNumberId).first<ConnectBusiness>();
    if (!business) continue;
    // Stable ID makes webhook replay idempotent even after an interrupted request.
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${business.id}\n${incoming.messageId}`));
    const eventId = Array.from(new Uint8Array(digest), (v) => v.toString(16).padStart(2, "0")).join("");
    const nonce = crypto.randomUUID();
    const statements = [db.prepare(`INSERT OR IGNORE INTO connect_events
      (id, business_id, message_id, message_type, received_at, route_label, email_to, telegram_chat_id, intake_nonce) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(eventId, business.id, incoming.messageId, incoming.messageType, now, business.route_label, business.email_to, business.telegram_chat_id, nonce)];
    statements.push(...await messageIntakeStatements(environment, business, payload, incoming.messageId, incoming.messageType, eventId, nonce, now));
    for (const [channel, column] of [["email", "email_to"], ["telegram", "telegram_chat_id"]]) {
      statements.push(db.prepare(`INSERT OR IGNORE INTO connect_deliveries
        (id, event_id, channel, destination, next_attempt_at) SELECT ?, id, ?, ${column}, received_at
        FROM connect_events WHERE id = ? AND ${column} <> ''`)
        .bind(`${eventId}:${channel}`, channel, eventId));
    }
    // Event, opted-in message content and its outbox entries commit together.
    const results = await db.batch(statements);
    accepted += Number(results[0].meta.changes > 0);
  }
  return accepted;
}

type Delivery = { id: string; channel: string; destination: string; attempts: number };

export async function dispatchConnectAlerts(environment: ConnectEnvironment, now = Date.now()) {
  const db = environment.APP_DB;
  const rows = await db.prepare(`SELECT d.id, d.channel, d.destination, d.attempts FROM connect_deliveries d
    JOIN connect_events e ON e.id = d.event_id JOIN connect_businesses b ON b.id = e.business_id
    WHERE b.enabled = 1 AND ((d.status = 'pending' AND d.next_attempt_at <= ?)
      OR (d.status = 'processing' AND d.claimed_at <= ?)) ORDER BY d.next_attempt_at LIMIT 20`)
    .bind(now, now - 120000).all<Delivery>();
  for (const delivery of rows.results) {
    const claim = crypto.randomUUID();
    const result = await db.prepare(`UPDATE connect_deliveries SET status = 'processing', claim_token = ?, claimed_at = ?, attempts = attempts + 1
      WHERE id = ? AND ((status = 'pending' AND next_attempt_at <= ?) OR (status = 'processing' AND claimed_at <= ?))
      AND EXISTS (SELECT 1 FROM connect_events e JOIN connect_businesses b ON b.id = e.business_id WHERE e.id = event_id AND b.enabled = 1)`)
      .bind(claim, now, delivery.id, now, now - 120000).run();
    if (!result.meta.changes) continue;
    try {
      await sendGenericAlert(environment, delivery.channel, delivery.destination);
      await db.prepare("UPDATE connect_deliveries SET status = 'sent', sent_at = ?, error_code = NULL WHERE id = ? AND claim_token = ?")
        .bind(Date.now(), delivery.id, claim).run();
    } catch (error) {
      const attempt = delivery.attempts + 1;
      const code = error instanceof AlertDeliveryError ? error.code : "delivery_interrupted";
      await db.prepare(`UPDATE connect_deliveries SET status = ?, next_attempt_at = ?, error_code = ?, claim_token = NULL
        WHERE id = ? AND claim_token = ?`).bind(attempt >= 8 ? "failed" : "pending", now + Math.min(3600000, 30000 * 2 ** (attempt - 1)), code, delivery.id, claim).run();
    }
  }
}

export async function maintainConnect(environment: ConnectEnvironment) {
  // Thirty-day technical inbox retention. Cascading deletion also clears destinations.
  await environment.APP_DB.prepare("DELETE FROM connect_events WHERE received_at < ?").bind(Date.now() - 30 * 86400000).run();
  await dispatchConnectAlerts(environment);
  await dispatchBackendMessages(environment);
}

export async function listConnectInbox(db: D1Database, email: string, admin: boolean) {
  const businesses = await db.prepare("SELECT * FROM connect_businesses WHERE ? = 1 OR member_email = ? COLLATE NOCASE ORDER BY name")
    .bind(Number(admin), email).all<ConnectBusiness>();
  const events = await db.prepare(`SELECT e.id, e.business_id, e.message_type, e.received_at, e.route_label, e.status,
    b.name AS business_name, (SELECT group_concat(channel || ': ' || status, ', ') FROM
      (SELECT channel,status FROM connect_deliveries WHERE event_id=e.id UNION ALL
       SELECT 'backend' AS channel,status FROM connect_backend_deliveries WHERE event_id=e.id)) AS deliveries
    FROM connect_events e JOIN connect_businesses b ON b.id = e.business_id
    WHERE ? = 1 OR b.member_email = ? COLLATE NOCASE ORDER BY e.received_at DESC LIMIT 100`)
    .bind(Number(admin), email).all<ConnectEvent>();
  return { businesses: businesses.results, events: events.results };
}

export async function updateConnectEvent(db: D1Database, id: string, email: string, admin: boolean, status: string, route: string) {
  return db.prepare(`UPDATE connect_events SET status = ?, route_label = ? WHERE id = ?
    AND EXISTS (SELECT 1 FROM connect_businesses b WHERE b.id = business_id AND (? = 1 OR b.member_email = ? COLLATE NOCASE))`)
    .bind(status, route, id, Number(admin), email).run();
}
