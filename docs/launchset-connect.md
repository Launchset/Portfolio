# Launchset Connect: first release

This release receives authorised WhatsApp Business message events, creates a private website alert, sends optional generic email and Telegram alerts, and lets the business label the work and track its status. Customer conversations remain in WhatsApp Business. Routing labels organise the inbox; they do not forward customer content or transfer a WhatsApp conversation to another number.

Future scope: LLM customer service, human handover, site integrations for Tubudd and the accounting product, and Embedded Signup for client onboarding. Those features are not implemented or represented as available in this release.

## Routes and access

- `/launchset-connect`: public product description, current release and planned additions.
- `/launchset-connect/workspace`: verified sign-in required. The Launchset admin sees all connections; a business member sees only connections whose `member_email` matches their verified email. Connect membership is independent of the billing portal.
- `/api/connect/inbox`: same business isolation as the workspace; no public or shared API key.
- `/api/connect/businesses`: administrator-only connection creation, editing and removal.
- `/api/connect/businesses/[id]/check`: admin or assigned business member checks the WABA phone list using the server-side Meta access token. This proves access to the specific WABA/phone pair; it does not claim Meta business verification or app approval.
- `/api/connect/events/[id]`: assigned member/admin updates a routing label and work status.
- `/api/connect/events/[id]/retry`: assigned member/admin requeues exhausted alert deliveries for an enabled connection.
- `/api/connect/webhooks/whatsapp`: Meta challenge verification and HMAC-SHA256 signature verification over the exact request bytes. No user session is needed for this provider endpoint.

All user mutations require an exact same-origin header and an authenticated, verified email. The app returns no credential values to the browser. The provider signature is checked before parsing or processing webhook JSON. Both WABA ID and phone number ID must match an enabled connection. Status updates and unrelated webhook fields produce no alerts. Text, image, voice and other incoming message types generate the same generic alert.

## Setup

1. Build the isolated preview from this branch, retaining existing bindings and production routes.
   `npm run deploy:connect-shadow` uses `wrangler.connect-shadow.jsonc` and the dedicated `launchset-connect-shadow` Worker. It reuses the existing shadow-only D1/R2 bindings while preserving the current `launchset-shadow` website deployment. Its authentication URL and trusted origin are explicitly configured for the new hostname.
2. Apply `migrations/app/0005_launchset_connect.sql` only to its shadow `APP_DB` before deployment. Production needs separate approval and its own migration.
3. Store the following as encrypted Worker secrets using a private CLI prompt or protected secret file, never chat, a browser form, Git or command arguments:
   - `CONNECT_META_APP_SECRET`: the Launchset Connect app secret.
   - `CONNECT_META_VERIFY_TOKEN`: a fresh random callback verification token.
   - `CONNECT_META_ACCESS_TOKEN`: a token authorised for the test WABA, with the management permission needed for the phone list. Use a durable, suitably limited token before production.
   - `CONNECT_META_GRAPH_API_VERSION`: a supported Graph version taken from the current Meta app setup; do not guess or silently use latest.
   - `CONNECT_TELEGRAM_BOT_TOKEN`: the new Launchset Connect bot token from BotFather.
4. The existing Cloudflare `AUTH_EMAIL` binding and `AUTH_EMAIL_FROM` sender deliver generic email alerts. Confirm sender/service configuration with an actual email test.
5. In BotFather, create a bot named `Launchset Connect Alerts`, using an available username such as `LaunchsetConnectAlertsBot`. John must open the new bot and press Start before it can send him private messages. Obtain his chat ID via the bot API without collecting unrelated chats; store only that ID in the relevant connection.
6. Sign in as the configured Launchset administrator. Create the test business **paused**, with its exact WABA ID, phone ID, member email, authorised alert destinations and routing label.
7. Run **Check Meta access**, then enable the connection. The server refuses activation until that check succeeds and required webhook/Telegram configuration is present.
8. In Meta, set the callback URL to `https://<preview-host>/api/connect/webhooks/whatsapp` with the private verification token. Subscribe the app to the WABA and the incoming `messages` field. A verified callback alone does not subscribe every business account.
9. Use Meta's test number and permitted test recipient for the live demonstration. Production approval, existing-number coexistence/onboarding and switching on real client alerts are separate later steps.

## Delivery and retention

The signed webhook commits each event and its outbox entries together before acknowledgement. A stable message/business identifier deduplicates repeated events. Notification destinations are snapshotted when the event first arrives, so replay after a settings change cannot introduce new recipients. No customer names, numbers, text or media are stored or sent to notification services.

Email and Telegram receive `New WhatsApp Business message`. The website inbox holds the business name, routing label, message type and receipt time. A one-minute scheduled job recovers delivery failures independently of a laptop. Each delivery has a claim to prevent concurrent workers from sending it together, a ten-second Telegram timeout and backoff between attempts. After eight attempts it is marked failed and can be retried explicitly in the workspace. A claim interrupted by worker termination becomes eligible again after two minutes.

Delivery is at least once: a provider may accept an alert immediately before a database acknowledgement fails, causing a duplicate on recovery. Pausing a business stops new intake and cancels queued alerts; an already-running provider request can finish. Resuming does not resend cancelled historical jobs. Removing the connection deletes its records; revoke the app's Meta access separately when ending an account relationship.

Technical inbox records and their deliveries are deleted after 30 days, before old jobs can be dispatched. Business settings and member/notification email addresses remain while the connection is configured. Credentials stay in encrypted Worker configuration. Do not log webhook bodies, provider access tokens or token-bearing Telegram URLs.

## Checks

```sh
npm run test:connect
npm run check
npm run build
git diff --check
```

The integration checks execute the migration and real SQLite queries, with simulated provider responses. They cover webhook signatures, mixed/status/media payloads, duplicate intake, account matching, business isolation, concurrent claims, retry recovery/exhaustion, recipient snapshots, activation checks and cascading retention/deletion. They do not prove live Meta or Telegram access.

Before claiming the first release is working end to end, run a real test-number message through the signed Meta webhook, verify the private inbox entry and actual email/Telegram delivery, and check the mobile workspace. Keep a pending item for any provider or authenticated flow that has not been verified.
