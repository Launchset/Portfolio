# WhatsApp test workflows

Agreed scope, 1 October 2026: reusable backend; Tubudd email/Telegram alerts; accounting message/document submissions; labels for different people and situations; text replies from a connected backend. No conversation inbox. Customer permissions and LLM automation are later work.

## Release boundary

The implementation is test-only. `CONNECT_WORKFLOWS` must name the exact Meta test phone ID. Every workflow in that configuration must use that same phone ID. This is a configuration assertion, not proof that an arbitrary ID belongs to a Meta test asset: read the actual ID from Meta before activation. Production numbers and real accounting records are outside this release.

The existing signed webhook and existing site authentication remain. This release adds no Meta permission request, Accounting role or capability grant. Server callback secrets authenticate delivery between the two services.

## Configuration

The Connect shadow uses `global_fetch_strictly_public` so HTTPS callbacks can reach another `workers.dev` Worker in the same Cloudflare account. Backend requests identify themselves as `Launchset-Connect/1.0`. Failed deliveries retain a safe network/HTTP error code; no response body, credential or customer content is logged. See [Cloudflare's Worker-to-Worker fetch guidance](https://developers.cloudflare.com/workers/runtime-apis/fetch/).

Backend and Meta requests use `redirect: "manual"` and reject non-success responses, including redirects. Cloudflare's runtime rejects `redirect: "error"` at request construction even when the destination does not redirect. A disposable check against the installed Workerd confirmed that `error` fails and `manual` succeeds. Redirected media downloads are covered by the existing negative tests. See [the runtime implementation](https://github.com/cloudflare/workerd/blob/main/src/workerd/api/http.c%2B%2B).

Store `CONNECT_WORKFLOWS` as an encrypted Worker secret. Shape:

```json
{
  "testPhoneNumberId": "<Meta test phone ID>",
  "workflows": [{
    "businessId": "<Connect connection UUID>",
    "phoneNumberId": "<Meta test phone ID>",
    "rules": [
      { "label": "Accounting", "type": "document" },
      { "label": "Accounting", "contains": "invoice" },
      { "label": "Tubudd", "sender": "<optional exact sender ID>" }
    ],
    "destinations": { "Accounting": "accounting" },
    "alerts": {
      "Accounting": { "emailTo": "", "telegramChatId": "" },
      "Tubudd": { "emailTo": "<alert email>", "telegramChatId": "<numeric chat ID>" }
    }
  }],
  "targets": [{
    "key": "accounting",
    "businessId": "<same Connect UUID>",
    "url": "https://<accounting-shadow-host>/accounting-api/api/integrations/launchset/accounting/events",
    "secret": "<unique random server secret, at least 32 characters>"
  }]
}
```

Rules run in order; the first matching rule selects one label. All supplied conditions must match. `sender` is exact; `type` is the provider message type; `contains` is case-insensitive literal text. Unmatched messages use the connection's default label. A label may select a backend target, email/Telegram recipients, or both. Omitting `alerts[label]` uses the connection's existing recipients. An empty destination explicitly disables that alert. Alert-only rules process the sender/text transiently and discard them.

URL and business identity are deployment configuration, never supplied by customer text. HTTPS callback targets cannot redirect. Queued delivery snapshots the original label and endpoint revision. Editing a URL does not redirect historical customer data to a new endpoint. Editing a label in the operator monitor changes only that monitor item; it does not replay a delivered message.

## Backend delivery

POST to the configured URL with:

- `Content-Type: application/json`
- `Idempotency-Key: <stable event ID>`
- `X-Launchset-Timestamp: <Unix seconds>`
- `X-Launchset-Signature: sha256=<hex HMAC>`

Signature: HMAC-SHA256(secret, timestamp + `.` + exact UTF-8 body bytes). The receiver checks the signature and a five-minute clock window before processing. It must persist and deduplicate the event before returning 2xx.

Body has `version: 1`, `event_id`, `business_id`, `phone_number_id`, `sender_id`, `sent_at` (milliseconds), `type`, `label`, `text`, and `document` (null or `{filename,mime_type,sha256,base64}`). The document contains actual bytes, not an expiring Meta URL. This first adapter supports text and documents; audio/image/video still generate generic alerts and do not have content forwarding implemented. The Meta adapter supports PDF, text and common Office documents up to 10 MiB; the Accounting receiver accepts its existing safe PDF, DOCX, XLSX and TXT formats. Unsupported or oversized files remain failed delivery records with a safe code.

Meta media lookup includes `phone_number_id`; downloads use only trusted Meta media hosts, no redirects, bounded byte counts and digest verification. Files are not stored separately in Launchset. Accounting stores the immutable original and reuses its existing file validation and SHA-256 deduplication.

Delivery is at least once. There are claimed jobs, stale-claim recovery and eight automatic attempts with backoff. The receiver must deduplicate; a provider or backend can accept just before the sending Worker loses its database acknowledgement. Retention clears message/job/reply records after 30 days. Disconnecting a connection cascades deletion. The receiving application retains its own records independently.

## Backend replies

POST `/api/connect/backends/<key>/replies` with the same timestamp/body HMAC headers and:

```json
{
  "operation": "reply",
  "backend_key": "accounting",
  "event_id": "<routed event ID>",
  "request_id": "<stable UUID generated by the backend>",
  "text": "We received your test document."
}
```

A reply refers to a routed event; the backend cannot supply another sender or number. Reuse the UUID for a retry of the same operation. Connect resolves the recipient and business server-side. Text replies require an open 24-hour service window based on Meta's original message timestamp, not webhook receipt time. Approved templates outside that window and outgoing file uploads are not implemented.

The response distinguishes `accepted`, `processing`, `rejected` and `unknown`. Accepted means Meta accepted the API call, not delivered/read. A timeout after sending can be uncertain; such calls are recorded as unknown and never resent automatically. Recheck rather than generate a new UUID blindly. Responses from the inbound backend callback are acknowledgements only; they are not automatically executed as WhatsApp replies.

## Accounting receiver

Prepared separately in `feature/launchset-whatsapp-intake-20261001`. Migration 033 stores external submissions and permits `whatsapp` source-document provenance. The encrypted `ACCOUNTING_LAUNCHSET_CONNECTIONS` configuration fixes a test destination `{key,secret,launchsetBusinessId,phoneNumberId,actorId,businessId,entityId}`. It uses the existing test identity and document access; there is no new customer permission model. The configured destination must be a shadow business.

Messages are external submissions, not accepted accountant instructions. No assistant turn, classification confirmation, journal, payment or posting is triggered. Files appear in the existing source-document list. Text submissions are accessible through the authenticated `/api/integrations/launchset/submissions` API. A submission UI and automatic processing remain separate decisions.

## Evidence and remaining live setup

Automated checks cover routing, generic recipients, content minimisation, real file bytes with mocked Meta transport, signed delivery, duplicates, replay after opt-in, reply window/idempotency and existing Accounting scope. Live Meta test-number receipt and email provider acceptance passed. The Telegram bot was created, its token installed and John's private destination configured after its `/start` arrived. John confirmed receipt of the generic Telegram alert for a subsequent WhatsApp reply; both alert delivery records were `sent`. His real WhatsApp `accounting test` text was labelled Accounting, delivered by Connect and stored once in Accounting's configured fictional scope after the Cloudflare runtime fix. Meta's temporary token was refreshed, and a signed request issued by the deployed Accounting backend resulted in a text reply accepted by Meta. Actual email inbox arrival, real document delivery and WhatsApp reply receipt remain pending. Configure the actual test WABA/phone and bot through the approved normal Chrome workflow; never claim mock tests are live provider evidence. See `meta-app-review.md` for the current evidence and remaining checks.

Official protocols: [Meta media API collection](https://www.postman.com/meta/whatsapp-business-platform/folder/13382743-ecb27be5-4d27-4763-bbee-6a8002c04bf3), [Meta Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api), [WhatsApp reply window policy](https://whatsappbusiness.com/policy/).
