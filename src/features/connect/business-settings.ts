import type { ConnectBusiness } from "./types";

const emailPattern = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

export function parseBusinessSettings(input: Record<string, unknown>) {
  const text = (name: string) => typeof input[name] === "string" ? input[name].trim() : "";
  const business = {
    id: text("id"),
    name: text("name"),
    waba_id: text("waba_id"),
    phone_number_id: text("phone_number_id"),
    member_email: text("member_email").toLowerCase(),
    email_to: text("email_to").toLowerCase(),
    telegram_chat_id: text("telegram_chat_id"),
    route_label: text("route_label") || "General enquiries",
    enabled: input.enabled === true ? 1 : 0,
  };
  if (business.name.length < 2 || business.name.length > 100) throw new Error("Enter a business name between 2 and 100 characters.");
  if (!/^\d{1,40}$/.test(business.waba_id) || !/^\d{1,40}$/.test(business.phone_number_id)) throw new Error("Enter the WhatsApp Business Account ID and phone number ID from Meta.");
  if (business.member_email && (!emailPattern.test(business.member_email) || business.member_email.length > 254)) throw new Error("Enter a valid business member email.");
  if (business.email_to && (!emailPattern.test(business.email_to) || business.email_to.length > 254)) throw new Error("Enter a valid alert email.");
  if (business.telegram_chat_id && !/^-?\d{1,20}$/.test(business.telegram_chat_id)) throw new Error("Enter the numeric Telegram chat ID.");
  if (business.route_label.length > 100) throw new Error("Keep the routing label within 100 characters.");
  if (business.id && !/^[a-f0-9-]{36}$/.test(business.id)) throw new Error("Invalid business ID.");
  return business;
}

export async function saveBusinessSettings(db: D1Database, input: ReturnType<typeof parseBusinessSettings>, now = Date.now()) {
  const id = input.id || crypto.randomUUID();
  const previous = input.id ? await db.prepare("SELECT * FROM connect_businesses WHERE id = ?").bind(id).first<ConnectBusiness>() : null;
  if (input.id && !previous) throw new Error("Business not found.");
  if (input.enabled && !previous?.last_checked_at) throw new Error("Check Meta account access before enabling this connection.");
  const duplicate = await db.prepare("SELECT id FROM connect_businesses WHERE phone_number_id = ? AND id <> ?")
    .bind(input.phone_number_id, id).first();
  if (duplicate) throw new Error("This phone number ID is already connected.");
  // Account identity is immutable once registered. Removing it clears its event history.
  if (previous && (previous.waba_id !== input.waba_id || previous.phone_number_id !== input.phone_number_id)) throw new Error("Remove this connection before changing its Meta account identifiers.");
  const statement = previous ? db.prepare(`UPDATE connect_businesses SET name = ?, member_email = ?, email_to = ?,
    telegram_chat_id = ?, route_label = ?, enabled = ?, updated_at = ? WHERE id = ?`)
    .bind(input.name, input.member_email, input.email_to, input.telegram_chat_id, input.route_label, input.enabled, now, id)
    : db.prepare(`INSERT INTO connect_businesses
      (id, name, waba_id, phone_number_id, member_email, email_to, telegram_chat_id, route_label, enabled, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, input.name, input.waba_id, input.phone_number_id, input.member_email, input.email_to, input.telegram_chat_id, input.route_label, input.enabled, now, now);
  const statements = [statement];
  if (!input.enabled) statements.push(db.prepare(`UPDATE connect_deliveries SET status = 'cancelled', claim_token = NULL
    WHERE event_id IN (SELECT id FROM connect_events WHERE business_id = ?) AND status IN ('pending', 'failed')`).bind(id));
  if (!input.enabled) statements.push(db.prepare(`UPDATE connect_backend_deliveries SET status='cancelled',claim_token=NULL
    WHERE event_id IN(SELECT id FROM connect_events WHERE business_id=?) AND status IN('pending','failed')`).bind(id));
  await db.batch(statements);
  return id;
}
