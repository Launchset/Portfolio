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
await build({ stdin: { contents: ["src/features/connect/inbox.ts", "src/features/connect/business-settings.ts", "src/platform/meta/whatsapp-webhook.ts", "src/platform/meta/account-access.ts", "src/features/connect/message-workflows.ts", "src/features/connect/workflow-settings.ts", "src/features/connect/backend-replies.ts", "src/platform/meta/message-actions.ts", "src/platform/notifications/backend-message.ts", "src/platform/notifications/backend-auth.ts", "src/features/connect/reviewer-login.ts"].map((file) => `export * from './${file}';`).join("\n"), resolveDir: root }, bundle: true, platform: "node", format: "esm", outfile: bundle });
const { receiveWhatsAppEvents, dispatchConnectAlerts, listConnectInbox, updateConnectEvent, maintainConnect, verifyWhatsAppSignature, extractWhatsAppEvents, readWebhookBody, checkWhatsAppAccountAccess, parseBusinessSettings, saveBusinessSettings } = await import(pathToFileURL(bundle).href);
const actions = await import(pathToFileURL(bundle).href);
const schema = await readFile(path.join(root, "migrations/app/0005_launchset_connect.sql"), "utf8") + await readFile(path.join(root, "migrations/app/0006_connect_message_workflows.sql"), "utf8");
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

test("reviewer password login cannot be enabled on production, other shadow sites or a foreign request origin", () => {
  const env = { BETTER_AUTH_URL: actions.connectReviewOrigin, AUTH_ADMIN_EMAIL: "owner@example.com",
    CONNECT_REVIEWER_LOGIN_ENABLED: "true", CONNECT_REVIEWER_EMAIL: "meta-reviewer@example.com" };
  assert.equal(actions.connectReviewerEmail(env, actions.connectReviewOrigin), "meta-reviewer@example.com");
  for (const origin of ["https://launchset.dev", "https://launchset-shadow.jhelyar04.workers.dev", "http://localhost:3000", "https://attacker.example"]) {
    assert.equal(actions.connectReviewerEmail({ ...env, BETTER_AUTH_URL: origin }), null);
    assert.equal(actions.connectReviewerEmail(env, origin), null);
  }
  assert.equal(actions.connectReviewerEmail({ ...env, CONNECT_REVIEWER_LOGIN_ENABLED: "false" }), null);
  assert.equal(actions.connectReviewerEmail({ ...env, CONNECT_REVIEWER_LOGIN_ENABLED: undefined }), null);
});

test("a reviewer credential cannot use the administrator identity or an invalid email", () => {
  const env = { BETTER_AUTH_URL: actions.connectReviewOrigin, AUTH_ADMIN_EMAIL: "owner@example.com", CONNECT_REVIEWER_LOGIN_ENABLED: "true" };
  for (const email of [undefined, "", "invalid", " OWNER@EXAMPLE.COM "]) {
    assert.equal(actions.connectReviewerEmail({ ...env, CONNECT_REVIEWER_EMAIL: email }), null);
  }
});

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

function workflowFixture(fixtureValue, rules = [{ label: 'Accounting', type: 'document' }, { label: 'Accounting', contains: 'invoice' }]) {
  const configuration = { testPhoneNumberId: '101', workflows: [{ businessId: 'a', phoneNumberId: '101', rules,
    destinations: { Accounting: 'accounting' }, alerts: { Support: { emailTo: 'support@example.com', telegramChatId: '' } } }],
    targets: [{ key: 'accounting', businessId: 'a', url: 'https://accounting.example.com/api/integrations/launchset/events', secret: 'a'.repeat(40) }] };
  fixtureValue.env.CONNECT_WORKFLOWS = JSON.stringify(configuration);
  return configuration;
}
function workflowPayload(type = 'text', text = 'Please process this invoice', sentAt = Date.now() - 1000) {
  const value = payload({ type }); const message = value.entry[0].changes[0].value.messages[0];
  message.timestamp = String(Math.floor(sentAt / 1000)); message.text.body = text;
  if (type === 'document') message.document = { id: '300', filename: 'invoice.pdf', mime_type: 'application/pdf', caption: text };
  return value;
}
async function intakeWorkflow(f, value = workflowPayload(), now = Date.now()) {
  await receiveWhatsAppEvents(f.env, value, now);
  return f.sqlite.prepare('SELECT id FROM connect_events').get().id;
}

test('test-only registry rejects a real phone, reused secrets, cross-business targets and private URLs', () => {
  const f = fixture(); const config = workflowFixture(f);
  assert.ok(actions.workflowConfiguration(f.env));
  for (const url of ['http://accounting.example.com', 'https://127.0.0.1/events', 'https://localhost/events', 'https://app.internal/events', 'https://user:pass@accounting.example.com']) {
    config.targets[0].url = url; f.env.CONNECT_WORKFLOWS = JSON.stringify(config); assert.equal(actions.workflowConfiguration(f.env), null);
  }
  config.targets[0].url = 'https://accounting.example.com/events'; config.workflows[0].phoneNumberId = '201';
  f.env.CONNECT_WORKFLOWS = JSON.stringify(config); assert.equal(actions.workflowConfiguration(f.env), null);
  config.workflows[0].phoneNumberId = '101'; config.targets[0].businessId = 'b';
  f.env.CONNECT_WORKFLOWS = JSON.stringify(config); assert.equal(actions.workflowConfiguration(f.env), null);
  config.targets[0].businessId = 'a'; config.targets.push({ ...config.targets[0], key: 'other' });
  f.env.CONNECT_WORKFLOWS = JSON.stringify(config); assert.equal(actions.workflowConfiguration(f.env), null);
});

test('rules use first match, AND conditions, person, message type and case-insensitive text', () => {
  const rules = [{ label: 'VIP documents', sender: '123', type: 'document' }, { label: 'Accounting', contains: 'invoice' }];
  const workflow = { rules };
  assert.equal(actions.matchRoutingLabel(workflow, '123', 'document', 'INVOICE', 'General'), 'VIP documents');
  assert.equal(actions.matchRoutingLabel(workflow, '456', 'document', 'INVOICE', 'General'), 'Accounting');
  assert.equal(actions.matchRoutingLabel(workflow, '123', 'text', 'hello', 'General'), 'General');
});

test('alert-only Tubudd routing snapshots selected recipients without storing content', async () => {
  const f = fixture(); workflowFixture(f, [{ label: 'Support', sender: '84999999999' }]);
  await intakeWorkflow(f, workflowPayload('text', 'A private booking question'));
  const event = f.sqlite.prepare('SELECT * FROM connect_events').get();
  assert.equal(event.route_label, 'Support'); assert.equal(event.email_to, 'support@example.com');
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM connect_messages').get().n, 0);
  assert.deepEqual(f.sqlite.prepare('SELECT channel,destination FROM connect_deliveries').all().map((row) => ({ ...row })), [{ channel: 'email', destination: 'support@example.com' }]);
  assert.ok(!JSON.stringify(event).includes('84999999999')); assert.ok(!JSON.stringify(event).includes('private booking'));
});

test('accounting captures required text/document fields once and excludes profile or raw webhook', async () => {
  const f = fixture(); workflowFixture(f); const value = workflowPayload('document'); const id = await intakeWorkflow(f, value);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM connect_backend_deliveries').get().n, 1);
  const stored = await actions.getConnectMessage(f.db, id, 'alice@example.com', false);
  assert.equal(stored.sender_id, '84999999999'); assert.equal(JSON.parse(stored.document_json).id, '300');
  assert.ok(!JSON.stringify(stored).includes('Private customer'));
  assert.equal(await actions.getConnectMessage(f.db, id, 'bob@example.com', false), null);
  value.entry[0].changes[0].value.messages[0].text.body = 'changed invoice';
  await receiveWhatsAppEvents(f.env, value);
  assert.equal(f.sqlite.prepare('SELECT text FROM connect_messages').get().text, 'Please process this invoice');
});

test('old generic events never acquire content or new backend destinations on replay after opt-in', async () => {
  const f = fixture(); const value = workflowPayload(); await intakeWorkflow(f, value);
  workflowFixture(f); await receiveWhatsAppEvents(f.env, value);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM connect_messages').get().n, 0);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM connect_backend_deliveries').get().n, 0);
});

test('backend delivers signed label/content once; receiver can verify exact bytes and reject stale signatures', async () => {
  const f = fixture(); const config = workflowFixture(f); const id = await intakeWorkflow(f); const calls = [];
  globalThis.fetch = async (url, options) => { calls.push({ url, options }); return Response.json({ accepted: true }); };
  await Promise.all([actions.dispatchBackendMessages(f.env), actions.dispatchBackendMessages(f.env)]);
  assert.equal(calls.length, 1); const { options } = calls[0]; const envelope = JSON.parse(new TextDecoder().decode(options.body));
  assert.equal(envelope.label, 'Accounting'); assert.equal(envelope.text, 'Please process this invoice');
  assert.equal(options.headers['Idempotency-Key'], id); assert.equal(options.redirect, 'manual');
  assert.equal(options.headers['User-Agent'], 'Launchset-Connect/1.0');
  assert.equal(await actions.verifyBackendRequest(config.targets[0].secret, options.headers['X-Launchset-Timestamp'], options.headers['X-Launchset-Signature'], options.body), true);
  assert.equal(await actions.verifyBackendRequest(config.targets[0].secret, options.headers['X-Launchset-Timestamp'], options.headers['X-Launchset-Signature'], new TextEncoder().encode('changed')), false);
  assert.equal(await actions.verifyBackendRequest(config.targets[0].secret, options.headers['X-Launchset-Timestamp'], options.headers['X-Launchset-Signature'], options.body, Date.now()+600000), false);
});

test('changed backend URL is held for review and cannot redirect queued content to a new endpoint', async () => {
  const f = fixture(); const config = workflowFixture(f); await intakeWorkflow(f);
  config.targets[0].url = 'https://other.example.com/events'; f.env.CONNECT_WORKFLOWS = JSON.stringify(config);
  let calls = 0; globalThis.fetch = async () => { calls++; return Response.json({}); };
  await actions.dispatchBackendMessages(f.env); assert.equal(calls, 0);
  assert.equal(f.sqlite.prepare('SELECT status,error_code FROM connect_backend_deliveries').get().status, 'failed');
});

test('document forwarding downloads phone-owned media and sends actual bytes with verified digest', async () => {
  const f = fixture(); workflowFixture(f); f.env.CONNECT_META_ACCESS_TOKEN='fixture'; f.env.CONNECT_META_GRAPH_API_VERSION='v26.0';
  await intakeWorkflow(f, workflowPayload('document'));
  const bytes = new TextEncoder().encode('%PDF-1.4\nfictional invoice\n%%EOF'); const sha256 = (await import('node:crypto')).createHash('sha256').update(bytes).digest('hex');
  let envelope; globalThis.fetch = async (url, options) => {
    assert.equal(options.redirect, 'manual');
    if (String(url).includes('graph.facebook.com')) { assert.ok(String(url).includes('phone_number_id=101')); return Response.json({url:'https://lookaside.fbsbx.com/file',file_size:bytes.length,mime_type:'application/pdf',sha256}); }
    if (String(url).includes('lookaside.fbsbx.com')) return new Response(bytes);
    envelope = JSON.parse(new TextDecoder().decode(options.body)); return Response.json({});
  };
  await actions.dispatchBackendMessages(f.env);
  assert.equal(envelope.document.filename, 'invoice.pdf'); assert.equal(envelope.document.sha256, sha256);
  assert.deepEqual(Buffer.from(envelope.document.base64,'base64'), Buffer.from(bytes));
});

test('document download blocks untrusted credential destinations and oversized, truncated or mismatched files', async () => {
  const f = fixture(); f.env.CONNECT_META_ACCESS_TOKEN='fixture'; f.env.CONNECT_META_GRAPH_API_VERSION='v26.0';
  let url = 'https://evil.example.com/file', size=1, hash; let calls=0;
  globalThis.fetch = async (requestUrl) => { calls++; return String(requestUrl).includes('graph.facebook.com')
    ? Response.json({url,file_size:size,mime_type:'application/pdf',sha256:hash}) : new Response(new Uint8Array([1])); };
  await assert.rejects(actions.downloadWhatsAppDocument(f.env,'101','300'), /invalid_media_url/); assert.equal(calls,1);
  url='https://lookaside.fbsbx.com/file'; size=actions.MAX_DOCUMENT_BYTES+1;
  await assert.rejects(actions.downloadWhatsAppDocument(f.env,'101','300'), /document_too_large/);
  size=2; await assert.rejects(actions.downloadWhatsAppDocument(f.env,'101','300'), /document_size_mismatch/);
  size=1; hash='bad'; await assert.rejects(actions.downloadWhatsAppDocument(f.env,'101','300'), /document_hash_mismatch/);
  calls=0; globalThis.fetch=async(requestUrl,options)=>{calls++;assert.equal(options.redirect,'manual');return String(requestUrl).includes('graph.facebook.com')
    ? Response.json({url,file_size:1,mime_type:'application/pdf'})
    : new Response(null,{status:302,headers:{Location:'https://evil.example.com/file'}});};
  await assert.rejects(actions.downloadWhatsAppDocument(f.env,'101','300'), /media_download_failed/); assert.equal(calls,2);
});

test('backend retry backoff, recovery, retention and business deletion include content jobs', async () => {
  const f = fixture(); workflowFixture(f); const now = Date.now(); await intakeWorkflow(f, workflowPayload(), now);
  let calls=0; globalThis.fetch=async()=>{calls++; return new Response('',{status:503});};
  await actions.dispatchBackendMessages(f.env,now); await actions.dispatchBackendMessages(f.env,now+1000); assert.equal(calls,1);
  assert.equal(f.sqlite.prepare('SELECT status FROM connect_backend_deliveries').get().status,'pending');
  assert.equal(f.sqlite.prepare('SELECT error_code FROM connect_backend_deliveries').get().error_code,'backend_http_503');
  globalThis.fetch=async()=>Response.json({}); await actions.dispatchBackendMessages(f.env,now+30001);
  assert.equal(f.sqlite.prepare('SELECT status FROM connect_backend_deliveries').get().status,'sent');
  f.sqlite.prepare('UPDATE connect_events SET received_at=1').run(); await maintainConnect(f.env);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM connect_messages').get().n,0);
  assert.equal(f.sqlite.prepare('SELECT count(*) n FROM connect_backend_deliveries').get().n,0);
});

test('replies use service window and trusted sender, reject other businesses and deduplicate concurrent sends', async () => {
  const f=fixture(); workflowFixture(f); f.env.CONNECT_META_ACCESS_TOKEN='fixture'; f.env.CONNECT_META_GRAPH_API_VERSION='v26.0'; const id=await intakeWorkflow(f);
  let calls=0; globalThis.fetch=async(url,options)=>{calls++; assert.ok(String(url).endsWith('/101/messages')); assert.equal(JSON.parse(options.body).to,'84999999999'); return Response.json({messages:[{id:'wamid.reply'}]});};
  const requestId=crypto.randomUUID();
  await assert.rejects(actions.replyToConnectMessage(f.env,id,'bob@example.com',false,requestId,'Hello'),/message_not_found/);
  const results=await Promise.all([actions.replyToConnectMessage(f.env,id,'alice@example.com',false,requestId,'Hello'),actions.replyToConnectMessage(f.env,id,'alice@example.com',false,requestId,'Hello')]);
  assert.equal(calls,1); assert.ok(results.some(r=>r.status==='accepted'));
  await assert.rejects(actions.replyToConnectMessage(f.env,id,'alice@example.com',false,requestId,'Changed'),/reply_id_conflict/);
  f.sqlite.prepare('UPDATE connect_messages SET sent_at=?').run(Date.now()-86400001);
  await assert.rejects(actions.replyToConnectMessage(f.env,id,'alice@example.com',false,crypto.randomUUID(),'Late'),/reply_window_closed/);
});

test('uncertain outbound send is marked unknown and never automatically retried', async () => {
  const f=fixture(); workflowFixture(f); f.env.CONNECT_META_ACCESS_TOKEN='fixture'; f.env.CONNECT_META_GRAPH_API_VERSION='v26.0'; const id=await intakeWorkflow(f);
  let calls=0; globalThis.fetch=async()=>{calls++; throw new Error('token-containing provider URL');};
  const requestId=crypto.randomUUID(); assert.equal((await actions.replyToConnectMessage(f.env,id,'alice@example.com',false,requestId,'Hello')).status,'unknown');
  assert.equal((await actions.replyToConnectMessage(f.env,id,'alice@example.com',false,requestId,'Hello')).status,'unknown'); assert.equal(calls,1);
});

test('signed backend replies are scoped to routed events and cannot select a different recipient', async () => {
  const f=fixture(); const config=workflowFixture(f); f.env.CONNECT_META_ACCESS_TOKEN='fixture'; f.env.CONNECT_META_GRAPH_API_VERSION='v26.0'; const id=await intakeWorkflow(f);
  const input={operation:'reply',backend_key:'accounting',event_id:id,request_id:crypto.randomUUID(),text:'Document received'};
  const raw=new TextEncoder().encode(JSON.stringify(input)); const timestamp=String(Math.floor(Date.now()/1000));
  const signature=`sha256=${await actions.signBackendBody(config.targets[0].secret,timestamp,raw)}`;
  await assert.rejects(actions.receiveBackendReply(f.env,'accounting',raw,timestamp,'sha256='+'0'.repeat(64)),/backend_not_authorised/);
  globalThis.fetch=async()=>Response.json({messages:[{id:'wamid.reply'}]});
  assert.equal((await actions.receiveBackendReply(f.env,'accounting',raw,timestamp,signature)).status,'accepted');
  config.targets[0].businessId='b'; config.workflows=[]; f.env.CONNECT_WORKFLOWS=JSON.stringify(config);
  await assert.rejects(actions.receiveBackendReply(f.env,'accounting',raw,timestamp,signature),/backend_not_authorised/);
});
