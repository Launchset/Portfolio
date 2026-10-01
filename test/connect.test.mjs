import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";
import { DatabaseSync } from "node:sqlite";
import { createHmac } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const root = path.resolve(import.meta.dirname, "..");
const temporary = await mkdtemp(path.join(process.env.TMPDIR || "/home/jhelyar04/.cache/agent-tmp", "connect-test."));
const bundle = path.join(temporary, "connect.mjs");
await build({ stdin: { contents: ["src/features/connect/inbox.ts", "src/features/connect/business-settings.ts", "src/platform/meta/whatsapp-webhook.ts", "src/platform/meta/account-access.ts"].map((file) => `export * from './${file}';`).join("\n"), resolveDir: root }, bundle: true, platform: "node", format: "esm", outfile: bundle });
const { receiveWhatsAppEvents, dispatchConnectAlerts, listConnectInbox, updateConnectEvent, maintainConnect, verifyWhatsAppSignature, extractWhatsAppEvents, readWebhookBody, checkWhatsAppAccountAccess, parseBusinessSettings, saveBusinessSettings } = await import(pathToFileURL(bundle).href);
const schema = await readFile(path.join(root, "migrations/app/0005_launchset_connect.sql"), "utf8");
const originalFetch = globalThis.fetch;
const databases = [];
afterEach(() => { globalThis.fetch = originalFetch; for (const db of databases.splice(0)) db.close(); });
after(async () => { await rm(temporary, { recursive: true }); });

class Statement {
  constructor(database, sql, args = []) { this.database = database; this.sql = sql; this.args = args; }
  bind(...args) { return new Statement(this.database, this.sql, args); }
  async run() { const result = this.database.prepare(this.sql).run(...this.args); return { meta: { changes: Number(result.changes) } }; }
  async first() { return this.database.prepare(this.sql).get(...this.args) ?? null; }
  async all() { return { results: this.database.prepare(this.sql).all(...this.args) }; }
}
function fixture() {
  const sqlite = new DatabaseSync(":memory:"); databases.push(sqlite); sqlite.exec(schema);
  const db = {
    prepare(sql) { return new Statement(sqlite, sql); },
    async batch(statements) {
      sqlite.exec("BEGIN");
      try { const results = []; for (const stmt of statements) results.push(await stmt.run()); sqlite.exec("COMMIT"); return results; }
      catch (error) { sqlite.exec("ROLLBACK"); throw error; }
    },
  };
  const sentEmails = [];
  const env = { APP_DB: db, CONNECT_TELEGRAM_BOT_TOKEN: "fixture-token", AUTH_EMAIL_FROM: "Launchset <login@launchset.dev>", AUTH_EMAIL: { async send(email) { sentEmails.push(email); } } };
  for (const [id, waba, phone, email] of [["a", "100", "101", "alice@example.com"], ["b", "200", "201", "bob@example.com"]]) {
    sqlite.prepare(`INSERT INTO connect_businesses (id,name,waba_id,phone_number_id,member_email,email_to,telegram_chat_id,route_label,enabled,last_checked_at,created_at,updated_at)
      VALUES (?,?,?,?,?,?,'123','Bookings',1,1,1,1)`).run(id, `Business ${id}`, waba, phone, email, email);
  }
  return { sqlite, db, env, sentEmails };
}
function payload({ waba = "100", phone = "101", id = "wamid.customer-1", type = "text" } = {}) {
  return { object: "whatsapp_business_account", entry: [{ id: waba, changes: [{ field: "messages", value: {
    metadata: { phone_number_id: phone }, contacts: [{ wa_id: "84999999999", profile: { name: "Private customer" } }],
    messages: [{ id, from: "84999999999", type, text: { body: "Private client message" } }],
  } }] }] };
}

test("signature rejects missing, malformed, wrong and tampered signatures", async () => {
  const body = new TextEncoder().encode(JSON.stringify(payload()));
  const signature = `sha256=${createHmac("sha256", "fixture-secret").update(body).digest("hex")}`;
  assert.equal(await verifyWhatsAppSignature(body, signature, "fixture-secret"), true);
  for (const sig of [null, "sha256=00", `sha256=${"0".repeat(64)}`]) assert.equal(await verifyWhatsAppSignature(body, sig, "fixture-secret"), false);
  assert.equal(await verifyWhatsAppSignature(new TextEncoder().encode("tampered"), signature, "fixture-secret"), false);
  assert.equal(await verifyWhatsAppSignature(body, signature, "wrong-secret"), false);
});

test("extracts every incoming media type and excludes status and unrelated events without copying customer content", () => {
  const events = extractWhatsAppEvents(payload({ type: "image" }));
  assert.deepEqual(events, [{ wabaId: "100", phoneNumberId: "101", messageId: "wamid.customer-1", messageType: "image" }]);
  const status = payload(); delete status.entry[0].changes[0].value.messages; status.entry[0].changes[0].value.statuses = [{ status: "delivered" }];
  assert.deepEqual(extractWhatsAppEvents(status), []);
  const unrelated = payload(); unrelated.entry[0].changes[0].field = "smb_message_echoes";
  assert.deepEqual(extractWhatsAppEvents(unrelated), []);
  for (const input of [null, {}, { object: "whatsapp_business_account", entry: [null, {}] }]) assert.deepEqual(extractWhatsAppEvents(input), []);
});

test("persists one event and one job per channel on webhook replay; notifications contain no customer data", async () => {
  const { env, sqlite, sentEmails } = fixture(); const calls = [];
  globalThis.fetch = async (_url, options) => { calls.push(JSON.parse(options.body)); return Response.json({ ok: true }); };
  assert.equal(await receiveWhatsAppEvents(env, payload(), 1000), 1);
  assert.equal(await receiveWhatsAppEvents(env, payload(), 2000), 0);
  assert.equal(sqlite.prepare("SELECT count(*) n FROM connect_events").get().n, 1);
  assert.equal(sqlite.prepare("SELECT count(*) n FROM connect_deliveries").get().n, 2);
  assert.ok(!JSON.stringify(sqlite.prepare("SELECT * FROM connect_events").all()).includes("Private"));
  await dispatchConnectAlerts(env, 2000); await dispatchConnectAlerts(env, 3000);
  assert.deepEqual(calls, [{ chat_id: "123", text: "New WhatsApp Business message" }]);
  assert.equal(sentEmails.length, 1); assert.ok(!JSON.stringify(sentEmails).includes("84999999999"));
  assert.equal(sqlite.prepare("SELECT count(*) n FROM connect_deliveries WHERE status='sent'").get().n, 2);
});

test("matching both WABA and phone is required; paused accounts and status-only events enqueue nothing", async () => {
  const { env, sqlite } = fixture();
  await receiveWhatsAppEvents(env, payload({ waba: "200", phone: "101" }));
  sqlite.prepare("UPDATE connect_businesses SET enabled=0 WHERE id='a'").run();
  await receiveWhatsAppEvents(env, payload());
  assert.equal(sqlite.prepare("SELECT count(*) n FROM connect_events").get().n, 0);
});

test("replayed events keep their original notification destinations after settings change", async () => {
  const { env, sqlite } = fixture();
  sqlite.prepare("UPDATE connect_businesses SET email_to='' WHERE id='a'").run();
  await receiveWhatsAppEvents(env, payload(), 1000);
  sqlite.prepare("UPDATE connect_businesses SET email_to='new@example.com',telegram_chat_id='456' WHERE id='a'").run();
  await receiveWhatsAppEvents(env, payload(), 2000);
  const jobs = sqlite.prepare("SELECT channel,destination FROM connect_deliveries").all();
  assert.deepEqual(jobs.map((j) => ({ ...j })), [{ channel: "telegram", destination: "123" }]);
});

test("business members cannot read or update another business; administrators can see both", async () => {
  const { env, db } = fixture(); await receiveWhatsAppEvents(env, payload()); await receiveWhatsAppEvents(env, payload({ waba: "200", phone: "201" }));
  const alice = await listConnectInbox(db, "ALICE@example.com", false);
  const bob = await listConnectInbox(db, "bob@example.com", false);
  assert.equal(alice.businesses.length, 1); assert.equal(alice.events.length, 1);
  assert.equal((await listConnectInbox(db, "unknown@example.com", false)).events.length, 0);
  assert.equal((await updateConnectEvent(db, bob.events[0].id, "alice@example.com", false, "done", "Stolen")).meta.changes, 0);
  assert.equal((await updateConnectEvent(db, alice.events[0].id, "alice@example.com", false, "in_progress", "Booking team")).meta.changes, 1);
  assert.equal((await listConnectInbox(db, "admin@example.com", true)).events.length, 2);
});

test("concurrent dispatch claims prevent duplicate sends", async () => {
  const { env } = fixture(); await receiveWhatsAppEvents(env, payload(), 1000); let telegram = 0;
  globalThis.fetch = async () => { telegram++; await new Promise((resolve) => setTimeout(resolve, 10)); return Response.json({ ok: true }); };
  await Promise.all([dispatchConnectAlerts(env, 1000), dispatchConnectAlerts(env, 1000)]);
  assert.equal(telegram, 1);
});

test("delivery failure backs off, later recovers, and never retries a successful channel", async () => {
  const { env, sqlite, sentEmails } = fixture(); await receiveWhatsAppEvents(env, payload(), 1000);
  globalThis.fetch = async () => new Response("private-provider-error", { status: 503 });
  await dispatchConnectAlerts(env, 1000);
  const failed = sqlite.prepare("SELECT * FROM connect_deliveries WHERE channel='telegram'").get();
  assert.equal(failed.status, "pending"); assert.equal(failed.next_attempt_at, 31000); assert.equal(failed.error_code, "telegram_http_503");
  globalThis.fetch = async () => Response.json({ ok: true });
  await dispatchConnectAlerts(env, 31000); assert.equal(sentEmails.length, 1);
  assert.equal(sqlite.prepare("SELECT status FROM connect_deliveries WHERE channel='telegram'").get().status, "sent");
});

test("crash recovery resumes an expired claim; repeated failures stop after eight attempts", async () => {
  const { env, sqlite } = fixture(); await receiveWhatsAppEvents(env, payload(), 1000);
  sqlite.prepare("UPDATE connect_deliveries SET status='processing',claimed_at=1000,attempts=7 WHERE channel='telegram'").run();
  globalThis.fetch = async () => Response.json({ ok: false });
  await dispatchConnectAlerts(env, 121001);
  const row = sqlite.prepare("SELECT status,attempts FROM connect_deliveries WHERE channel='telegram'").get();
  assert.equal(row.status, "failed"); assert.equal(row.attempts, 8);
});

test("retention and removing a connection cascade to its delivery records", async () => {
  const { env, sqlite, sentEmails } = fixture(); await receiveWhatsAppEvents(env, payload(), Date.now() - 31 * 86400000);
  globalThis.fetch = async () => Response.json({ ok: true });
  await maintainConnect(env); assert.equal(sqlite.prepare("SELECT count(*) n FROM connect_events").get().n, 0);
  assert.equal(sentEmails.length, 0);
  await receiveWhatsAppEvents(env, payload()); sqlite.prepare("DELETE FROM connect_businesses WHERE id='a'").run();
  assert.equal(sqlite.prepare("SELECT count(*) n FROM connect_deliveries").get().n, 0);
});

test("a new connection stays paused until actual Meta account access is checked", async () => {
  const { db } = fixture();
  const input = parseBusinessSettings({ name: "Demo business", waba_id: "300", phone_number_id: "301", enabled: true });
  await assert.rejects(saveBusinessSettings(db, input), /Check Meta account access/);
  await saveBusinessSettings(db, { ...input, enabled: 0 });
  assert.throws(() => parseBusinessSettings({ name: "Demo", waba_id: "x", phone_number_id: "301" }), /Account ID/);
});

test("account check uses management API, handles pagination and rejects an unrelated phone", async () => {
  const env = { CONNECT_META_ACCESS_TOKEN: "fixture-token", CONNECT_META_GRAPH_API_VERSION: "v24.0" }; let page = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.headers.Authorization, "Bearer fixture-token"); assert.equal(url.hostname, "graph.facebook.com");
    page++; return Response.json(page === 1 ? { data: [{ id: "other" }], paging: { next: "not-followed", cursors: { after: "cursor" } } } : { data: [{ id: "101" }] });
  };
  await checkWhatsAppAccountAccess(env, "100", "101"); assert.equal(page, 2);
  globalThis.fetch = async () => Response.json({ data: [{ id: "other" }] });
  await assert.rejects(checkWhatsAppAccountAccess(env, "100", "101"), /not found/);
});

test("bounded request reader rejects oversized bodies with and without content length", async () => {
  assert.equal(await readWebhookBody(new Request("https://example.com", { method: "POST", body: "x", headers: { "Content-Length": "262145" } })), null);
  assert.equal(await readWebhookBody(new Request("https://example.com", { method: "POST", body: "x".repeat(262145) })), null);
});
