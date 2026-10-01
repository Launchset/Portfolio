# Meta review preparation

App: Launchset Connect (`1003785039392939`). Business: John Helyar trading as Launchset. Business portfolio: `786110224586080`.

Last confirmed business verification: **In review**. Domain ownership: `launchset.dev` verified. App Review: **Not submitted**. Refresh these statuses in Meta before submission.

## Preview validation on 1 October 2026

Preview: https://launchset-connect-shadow.jhelyar04.workers.dev/launchset-connect

The isolated Worker was deployed successfully and migrations `0005_launchset_connect.sql` and `0006_connect_message_workflows.sql` were applied to `launchset-app-shadow`. The existing Launchset production Worker and shared `launchset-shadow` Worker were not deployed. A new authentication secret was installed only in the Connect preview.

Lint, TypeScript, the Next.js production build and the Cloudflare runtime build passed. All 26 SQLite/provider integration checks passed. Earlier signed-out browser checks confirmed the product/privacy/terms pages returned 200, the event API returned 401, business changes returned 403 and unconfigured webhook requests returned 503. All seven responses carried noindex headers, and the workspace redirected to sign-in. The public page was visually inspected in Chromium.

Meta created test WABA `1373012368376197` with phone `1427558373768262`, display number `+1 555-163-2129`. A real token generated in the Launchset Connect Graph API Explorer was captured securely. Authenticated `v25.0` GET calls to the phone and WABA phone list both returned 200 with that test number. John confirmed the Meta password prompt; the app secret was then captured securely. The access token, app secret, private callback token, API version and test workflow registry are installed as encrypted secrets on the isolated Connect Worker. No real business phone was connected.

The backend's private challenge check returned 200 with the exact challenge. Meta's app subscription POST returned success; read-back showed an active `whatsapp_business_account` callback at `https://launchset-connect-shadow.jhelyar04.workers.dev/api/connect/webhooks/whatsapp`, subscribed only to `messages`. Meta reported that field's webhook version as `v26.0`; outbound/account API calls remain explicitly configured as the setup page's `v25.0`. Subscribing the test WABA also returned success; read-back showed Launchset Connect alongside Meta's existing DevX test app. John added and verified the permitted recipient directly in Meta.

The final code shadow deployment version is `67288cff-2f25-4431-8207-84b7cc5491ed`. Its product route returned 200 with backend copy/noindex, and the unconfigured backend reply request returned 403. The test connection was created paused, then activated after the application's actual Meta account-access function passed. Documents and text containing `invoice` or `accounting` route to Accounting with alerts disabled; other types use the default Tubudd label and configured generic alert recipients. These are test routing rules, not permanent customer/business assignments.

The first sample send was rejected with 133010: the Meta test sender was still pending. John manually registered only that test sender through Graph API Explorer, choosing his private PIN. A subsequent phone query reported `CONNECTED` and `CLOUD_API`. The `hello_world` sample send returned 200 with a message ID; John confirmed receipt and replied. Connect recorded one incoming text event, label `Tubudd`, and an email delivery marked `sent` without error. This proves real Meta receipt and email service acceptance; actual email inbox arrival still needs confirmation. Meta included the registration PIN in the Explorer URL and the browser resume response echoed it. The agent removed those URL parameters without reading the form or repeating/storing the PIN. That test PIN needs replacement; no PIN value belongs in these evidence records.

The Accounting receiver was deployed to its fictional shadow API at revision `11cf977a4eb649bbcf1e72c75e5707df09c320c4`, with migration 033. Real HTTP requests through its public Worker proxy accepted signed fictional text and PDF deliveries; repeated requests returned the same records. PostgreSQL confirmed durable submissions and WhatsApp document provenance. This verifies the receiver transport, not a WhatsApp webhook or Connect outbox delivery.

The Telegram bot `@LaunchsetConnectAlertsBot` was created through the verified BotFather chat on an approved replacement work tab. Its identity was verified with `getMe`, and its token was captured without displaying it and installed as an encrypted secret on the isolated Connect Worker. John still needs to start the bot before his private chat can be configured. Telegram delivery, actual Accounting receipt through Connect, backend reply, the signed-in delivery monitor and mobile presentation remain unverified. These checks do not establish every intended workflow or review readiness.

## First-release description

Launchset Connect is a reusable messaging backend. Configured routing labels select generic email/Telegram alerts for Tubudd or signed text/document delivery to Accounting. Notification services receive no customer names, numbers or message content. A connected backend can request a text reply for its routed event within the service window. Launchset administers test connections and provides a private delivery monitor; existing verified member access remains in place.

No LLM, automatic customer reply, bulk campaign, Embedded Signup or new customer permission model is enabled. Accounting intake stores external evidence; it does not trigger an assistant turn or accounting action. Chatbots and customer onboarding are future plans. Tell reviewers what is implemented and demonstrated, not what the roadmap may later include.

## Permission evidence

| Permission | Intended first-release use | Required evidence still to capture |
| --- | --- | --- |
| `whatsapp_business_management` | Read the authorised WABA phone list and validate that the selected phone belongs to that account. | Actual test phone/list calls passed; capture the signed-in account check and review screencast. |
| `whatsapp_business_messaging` | Receive messages/documents, route generic alerts or authorised backend submissions, and send a backend-requested text reply. | Real signed webhook, email/Telegram alerts, backend text/document receipt and real text send still pending. Follow Meta's live permission review/test-call requirements. |
| `public_profile` | Only if required by the selected Facebook Login for Business/Embedded Signup configuration. | Reassess this request before submission: first-release workspace login uses Google or email, and Embedded Signup is not yet implemented. Remove unnecessary permissions rather than claiming unused functionality. |

These are draft explanations, not completed certifications. API tests must be made with the actual app/test assets; simulated SQLite or provider fixtures do not count as Meta API evidence.

## Reviewer access and recording

1. Add the appropriate Website platform and URL in Meta. The last inspected reviewer-instructions page said no app platforms were configured.
2. Provide a dedicated verified reviewer member email for a test business. Do not give out John's personal Meta/Google account or admin credentials. Agree a workable sign-in procedure with the reviewer before submission; a private magic-link inbox is not usable without access.
3. Record the actual release on its final review host, showing business context, Meta account access check, permitted test message/document receipt, email/Telegram alerts, backend storage, routing labels and a backend-requested text reply. Avoid secrets or unrelated personal/client messages.
4. Explain that configured routing rules select backend actions. Monitor label edits do not replay historical deliveries. Do not show a simulated chatbot or suggest LLM replies are live.
5. Review allowed usage for each requested permission, upload the screencast and confirm the required successful API tests in Meta.
6. Submit only after all Meta steps are complete, the reviewed version is deployed to an approved review URL, and John has reviewed the exact final submission.

## Data handling draft facts

- Cloudflare hosts the service and stores backend secrets, connection settings and 30-day technical event/delivery records.
- The webhook transiently contains customer data. Generic alert routes retain no customer content. Explicit backend routes retain the sender identifier, text, provider time, document reference and reply data needed for delivery for 30 days. Document bytes are downloaded and delivered to the configured receiving application; its storage/retention is independent. Customer profile names and raw webhook bodies are not stored.
- Email/Telegram notifications carry only the generic alert. Recipient addresses/chat IDs and bot credentials are configured by the business/Launchset.
- No LLM provider receives data in this release. Update the workflow, agreements, notices and data handling answers before enabling one.
- Launchset controls its service administration data; each connected business controls its customer communication purposes. Confirm the legal entity/controller wording appropriate to the exact Meta form instead of blindly pasting this summary.
- Public-authority disclosure history and internal request-handling policies need John's actual answers. Do not assume these from code or from a drafted privacy notice.

## Remaining live gates

- [ ] Business verification result checked.
- [x] Meta credentials securely installed in the isolated preview (test token; durable production token remains later work).
- [x] New Telegram bot created and its token securely installed in the preview.
- [ ] John's private Telegram chat identified and configured after a setup message reaches the bot.
- [x] Actual Meta management calls succeed for the test WABA/phone.
- [x] Callback verified and test WABA/messages subscription confirmed.
- [x] Permitted test recipient verified by John.
- [x] Test sender registered by John; sample API send and receipt confirmed.
- [x] Real reply reaches Connect; generic email service accepts its alert.
- [ ] Test sender's exposed registration PIN replaced privately by John.
- [ ] Real test message produces a delivery-monitor event and actual email/Telegram notifications.
- [x] Accounting's deployed signed callback accepts fictional text/PDF and deduplicates replay.
- [ ] Real Meta text/document reaches Accounting through Connect; backend-requested text reply succeeds.
- [ ] Signed-in browser review, mobile layout and member isolation verified.
- [ ] Final review host/platform, reviewer sign-in, permission scope and screencast prepared.
- [ ] Accurate data handling answers confirmed.
- [ ] Exact production release and final Meta submission approved.

References: [Meta Tech Provider overview](https://whatsappbusiness.com/partners/become-a-partner/), [WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/), [Telegram Bot API](https://core.telegram.org/bots/api), [Cloudflare Email Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/). Follow the live app review form for the precise requirements of this submission.
