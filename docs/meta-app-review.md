# Meta review preparation

App: Launchset Connect (`1003785039392939`). Business: John Helyar trading as Launchset. Business portfolio: `786110224586080`.

Business verification checked live on 2 October 2026: **In review**. Meta blocks Tech Provider access verification until business verification is complete. Domain ownership: `launchset.dev` verified. App Review: **Not submitted**. Refresh these statuses before submission.

## Preview validation on 1 October 2026

Preview: https://launchset-connect-shadow.jhelyar04.workers.dev/launchset-connect

The isolated Worker was deployed successfully and migrations `0005_launchset_connect.sql` and `0006_connect_message_workflows.sql` were applied to `launchset-app-shadow`. The existing Launchset production Worker and shared `launchset-shadow` Worker were not deployed. A new authentication secret was installed only in the Connect preview.

Lint, TypeScript, the Next.js production build and the Cloudflare runtime build passed. All 26 SQLite/provider integration checks passed. Earlier signed-out browser checks confirmed the product/privacy/terms pages returned 200, the event API returned 401, business changes returned 403 and unconfigured webhook requests returned 503. All seven responses carried noindex headers, and the workspace redirected to sign-in. The public page was visually inspected in Chromium.

Meta created test WABA `1373012368376197` with phone `1427558373768262`, display number `+1 555-163-2129`. A real token generated in the Launchset Connect Graph API Explorer was captured securely. Authenticated `v25.0` GET calls to the phone and WABA phone list both returned 200 with that test number. John confirmed the Meta password prompt; the app secret was then captured securely. The access token, app secret, private callback token, API version and test workflow registry are installed as encrypted secrets on the isolated Connect Worker. No real business phone was connected.

The backend's private challenge check returned 200 with the exact challenge. Meta's app subscription POST returned success; read-back showed an active `whatsapp_business_account` callback at `https://launchset-connect-shadow.jhelyar04.workers.dev/api/connect/webhooks/whatsapp`, subscribed only to `messages`. Meta reported that field's webhook version as `v26.0`; outbound/account API calls remain explicitly configured as the setup page's `v25.0`. Subscribing the test WABA also returned success; read-back showed Launchset Connect alongside Meta's existing DevX test app. John added and verified the permitted recipient directly in Meta.

The 1 October workflow-fix deployment version is `37e783b8-3bb0-4af1-8819-1456dbc09f57`, including Cloudflare-compatible requests with redirects blocked. Its predecessor's product route returned 200 with backend copy/noindex, and the unconfigured backend reply request returned 403. The test connection was created paused, then activated after the application's actual Meta account-access function passed. Documents and text containing `invoice` or `accounting` route to Accounting with alerts disabled; other types use the default Tubudd label and configured generic alert recipients. These are test routing rules, not permanent customer/business assignments.

The first sample send was rejected with 133010: the Meta test sender was still pending. John manually registered only that test sender through Graph API Explorer, choosing his private PIN. A subsequent phone query reported `CONNECTED` and `CLOUD_API`. The `hello_world` sample send returned 200 with a message ID; John confirmed receipt and replied. Connect recorded one incoming text event, label `Tubudd`, and an email delivery marked `sent` without error. This proves real Meta receipt and email service acceptance; actual email inbox arrival still needs confirmation. Meta included the registration PIN in the Explorer URL and the browser resume response echoed it. The agent removed those URL parameters without reading the form or repeating/storing the PIN. That test PIN needs replacement; no PIN value belongs in these evidence records.

The Accounting receiver was deployed to its fictional shadow API at revision `11cf977a4eb649bbcf1e72c75e5707df09c320c4`, with migration 033. Real HTTP requests through its public Worker proxy accepted signed fictional text and PDF deliveries; repeated requests returned the same records. PostgreSQL confirmed durable submissions and WhatsApp document provenance. This verifies the receiver transport, not a WhatsApp webhook or Connect outbox delivery.

The Telegram bot `@LaunchsetConnectAlertsBot` was created through the verified BotFather chat on an approved replacement work tab. Its identity was verified with `getMe`, and its token was captured without displaying it and installed as an encrypted secret on the isolated Connect Worker. John's private `/start` event was received and only its chat ID was configured as the destination. A second WhatsApp reply reached Connect at 09:47:55 UTC; its email and Telegram delivery records both became `sent` without errors, and John confirmed the generic Telegram alert arrived.

John sent `accounting test` to the Meta test number. Connect received it at 09:48:33 UTC, selected the Accounting label and queued only backend delivery. Initial attempts failed because Cloudflare rejects `redirect: "error"` when constructing a request. A disposable check using the installed Workerd confirmed `error` fails and `manual` succeeds. Backend and Meta adapters now use manual redirect handling and reject non-success responses; the shadow also enables public Worker-to-Worker fetch and identifies backend requests with a User-Agent. All 26 regression checks, lint, TypeScript, Next.js and Cloudflare builds passed. The original queued event succeeded on attempt seven after deployment and a signed empty dispatcher trigger; no replacement message event was created. Accounting's configured fictional scope contains exactly one corresponding text submission with the Accounting label. This verifies real Meta-to-Connect-to-Accounting text delivery.

Meta's private `debug_token` check confirmed the first temporary test token became invalid after its 10:00 UTC expiry on 1 October 2026. John approved a replacement signed-in tab. A fresh Explorer token was captured privately; validation confirmed the correct app, both existing WhatsApp scopes and access to the exact test sender. Only the refreshed token was installed on the Connect Worker. It expires at 12:00 UTC on 1 October 2026, so durable credentials remain later work.

The deployed Accounting API then issued one signed reply request for its stored test submission, using a stable UUID and its private callback secret. Connect returned HTTP 200 / `accepted` with a provider message ID. This proves the connected-backend-to-Connect-to-Meta API path; John's receipt confirmation is pending. Actual email inbox arrival, WhatsApp reply receipt, the signed-in delivery monitor and mobile presentation remain unverified. These checks do not establish every intended workflow or review readiness.

John sent a PDF from his phone to the same Meta test conversation. Connect received the document at 10:46:32 UTC, selected the Accounting label and completed backend delivery on its first attempt without error. A scoped PostgreSQL read confirmed the corresponding submission links to a stored `application/pdf` source document with `intake_channel: whatsapp`; its declared and stored byte counts both equal 36,293. The configured scope contains the earlier text submission and this document submission. No document content or filename was printed. This verifies the real WhatsApp-to-Meta-to-Connect-to-Accounting document path. John's computer upload had remained pending; these results do not establish a general WhatsApp desktop media restriction.

## Test token refreshed on 2 October 2026

At 07:48 UTC, Meta's Graph API Explorer renewed the existing token for Launchset Connect with the two selected WhatsApp permissions. No password prompt was required. The token was captured as an encrypted envelope and validated privately before installation. Meta reported the correct app, both WhatsApp scopes and its standard `public_profile` scope; the exact test WABA phone list returned the configured phone as `CONNECTED` / `CLOUD_API`. Only `CONNECT_META_ACCESS_TOKEN` was installed on the isolated Connect Worker. API calls remain on the existing `v25.0` configuration. No real business phone or App Review answer was changed.

The refreshed temporary token expires at **09:00 UTC on 2 October 2026 (16:00 Vietnam time)**. This is not a durable production or reviewer credential. After installation, the test reviewer signed in successfully and the deployed **Check Meta access** endpoint returned 200 / checked for its one assigned test connection. The subsequent test and John's receipt confirmation are recorded below; the demonstration recording remains pending.

## Fresh end-to-end test on 2 October 2026

After the token refresh, John confirmed sending the requested phone tests. Connect received a Tubudd-labelled text at 07:58:52 UTC; its email and Telegram delivery records both became `sent` without errors. John subsequently confirmed both the email and Telegram alerts arrived.

An Accounting-labelled text arrived at 07:58:59 UTC and a PDF at 08:01:01 UTC. Both backend deliveries succeeded on their first attempt. Scoped reads from the deployed Accounting database confirmed the corresponding submissions in the configured fictional scope. The PDF has WhatsApp provenance, MIME type `application/pdf` and matching declared/stored length of **240,204 bytes**. The earlier text and 36,293-byte document remain separate historical test events; no real UK-business mapping was introduced.

The deployed Accounting backend issued a single signed reply request tied to today's delivered text, with a newly generated stable request UUID saved before sending. Connect returned HTTP 200 / `accepted` with a Meta provider message ID. This proves fresh backend-to-Connect-to-Meta API acceptance, not WhatsApp delivery/read. No automatic accounting or assistant action was triggered. After being asked separately about today's Telegram alert, email alert and WhatsApp reply, John answered that it all worked. This confirms receipt of all three for today's test; it does not retroactively establish receipt of every earlier attempt.

## First-release description

Launchset Connect is a reusable messaging backend. Configured routing labels select generic email/Telegram alerts for Tubudd or signed text/document delivery to Accounting. Notification services receive no customer names, numbers or message content. A connected backend can request a text reply for its routed event within the service window. Launchset administers test connections and provides a private delivery monitor; existing verified member access remains in place.

No LLM, automatic customer reply, bulk campaign, Embedded Signup or new customer permission model is enabled. Accounting intake stores external evidence; it does not trigger an assistant turn or accounting action. Chatbots and customer onboarding are future plans. Tell reviewers what is implemented and demonstrated, not what the roadmap may later include.

## Permission evidence

| Permission | Intended first-release use | Required evidence still to capture |
| --- | --- | --- |
| `whatsapp_business_management` | Read the authorised WABA phone list and validate that the selected phone belongs to that account. | Actual test phone/list calls passed; capture the signed-in account check and review screencast. |
| `whatsapp_business_messaging` | Receive messages/documents, route generic alerts or authorised backend submissions, and send a backend-requested text reply. | Signed webhook and backend text/document receipt passed. John confirmed email, Telegram and WhatsApp reply receipt on 2 October. Record the final review screencast. Follow Meta's live permission review/test-call requirements. |
| `public_profile` | Only if required by the selected Facebook Login for Business/Embedded Signup configuration. | Reassess this request before submission: first-release workspace login uses Google or email, and Embedded Signup is not yet implemented. Remove unnecessary permissions rather than claiming unused functionality. |

These are draft explanations, not completed certifications. API tests must be made with the actual app/test assets; simulated SQLite or provider fixtures do not count as Meta API evidence.

### Draft permission explanations

`whatsapp_business_management`: Launchset Connect reads the authorised WhatsApp Business Account's phone-number list and checks that the configured number belongs to that account before enabling the connection. This associates the backend with the correct business number. The current demonstration uses Launchset's Meta test account and number; client Embedded Signup has not been implemented. The review recording must show the real account-access check and its result.

`whatsapp_business_messaging`: Launchset Connect receives incoming WhatsApp text and document events through a signed webhook. Configured labels select generic email/Telegram notifications or signed delivery of the text and document bytes to a connected application. The Accounting test backend stores those submissions in its own business scope. A connected backend can request a text reply to the sender within the permitted service window. Alerts contain no customer message content; submissions do not trigger an automatic reply or accounting action. The current demonstration covers real test-number text/document receipt, confirmed email/Telegram alerts, durable Accounting storage and a backend-requested reply accepted by Meta and confirmed received by John on 2 October.

Use these paragraphs as drafts for the matching live permission questions. They do not replace the requested screencast, reviewer access, business verification or Meta's other application requirements. Final data-handling answers and submission require John's review.

### Live form preparation on 1 October 2026

Meta's draft requests `whatsapp_business_messaging`, `public_profile` and `whatsapp_business_management`. Both WhatsApp permission dialogs now report required API test calls **Completed**. The messaging explanation was entered, discussed with John in plain English, approved by him and saved as a draft. Reopening the dialog returned the matching explanation. Its policy agreement remains unchecked and no recording has been uploaded. The management explanation and any future need for `public_profile` still need John's review.

The data-handling form asks about processors, the responsible person/entity and country, national-security disclosures during the preceding twelve months, and procedures for requests from public authorities. John answered **No** to the disclosure-history question. After the four rules were explained and the draft was provided for review, John agreed to adopt the [public-authority request procedure](platform-data-requests.md) on 1 October 2026. The procedure covers legality checks, questioning unlawful or excessive requests where permitted, minimum necessary disclosure and a private decision record. John remains the decision-maker for any disclosure; no actual request records have been created. The No disclosure-history answer and all four procedure boxes were entered in Meta. The form reported Auto-saved; a full reload and reopening the section confirmed all five choices persisted. John subsequently confirmed the responsible person/entity as John Helyar trading as Launchset and the country as United Kingdom. Those values were entered; the form reported Auto-saved, and a full reload plus reopening confirmed both values and the previously approved choices persisted. Provider access is drafted as Yes because Cloudflare hosts Connect and DigitalOcean hosts the connected Accounting backend. Provider entries were subsequently saved on 2 October as described below. No final submission was made.

Reviewer instructions remain blocked until an app platform is configured. Basic settings have the Launchset Connect name, icon, Messaging category, public privacy/terms URLs and privacy-page deletion instructions. The Website platform is not selected and its site URL is empty. Agree the actual review URL and workable reviewer access before saving that configuration. John requires discussion of the exact proposed submission and explicit approval before final submission; approval of one explanation is not approval to submit or certify other answers.

## Reviewer access and recording

1. Add the appropriate Website platform and URL in Meta. The last inspected reviewer-instructions page said no app platforms were configured.
2. Provide a dedicated verified reviewer member email for a test business. Do not give out John's personal Meta/Google account or admin credentials. Agree a workable sign-in procedure with the reviewer before submission; a private magic-link inbox is not usable without access.
3. Record the actual release on its final review host, showing business context, Meta account access check, permitted test message/document receipt, email/Telegram alerts, backend storage, routing labels and a backend-requested text reply. Avoid secrets or unrelated personal/client messages.
4. Explain that configured routing rules select backend actions. Monitor label edits do not replay historical deliveries. Do not show a simulated chatbot or suggest LLM replies are live.
5. Review allowed usage for each requested permission, upload the screencast and confirm the required successful API tests in Meta.
6. Submit only after all Meta steps are complete, the reviewed version is deployed to an approved review URL, and John has reviewed the exact final submission.

### Reviewer login implemented on 2 October 2026

John approved a separate test email/password login. It is now deployed and verified at [the isolated reviewer page](https://launchset-connect-shadow.jhelyar04.workers.dev/launchset-connect/reviewer). The account is assigned only to the existing Meta test connection. Live checks confirmed correct sign-in, one-business scope, blocked password sign-up, blocked administrator API/pages and no billing access. Chrome form sign-in reached the visually inspected delivery monitor. The 28 integration checks, lint, TypeScript, Next.js and OpenNext builds passed. Credentials remain private outside Git. See [reviewer access and proposed instructions](meta-reviewer-access.md).

This completes the test login, not the reviewer recording or application. The Meta test token was refreshed later on 2 October with the limited expiry recorded above; mobile presentation is not yet verified, and the final Website platform/reviewer instructions require the agreed application review. Nothing was submitted to Meta.

Later on 2 October, a 38-second silent reviewer-access clip was recorded using existing broker screenshots and the installed encoder. It shows the actual login, a successful live account check at 08:37:29 UTC, and existing Accounting/Tubudd delivery results. Saved frames were decoded and visually checked. The phone sends, destination inboxes, Accounting storage UI and reply receipt remain separate clips; no video upload or application submission occurred. See [recording status and timeline](meta-review-recording.md).

## Data handling draft facts

- Cloudflare hosts the service and stores backend secrets, connection settings and 30-day technical event/delivery records.
- The webhook transiently contains customer data. Generic alert routes retain no customer content. Explicit backend routes retain the sender identifier, text, provider time, document reference and reply data needed for delivery for 30 days. Document bytes are downloaded and delivered to the configured receiving application; its storage/retention is independent. Customer profile names and raw webhook bodies are not stored.
- Email/Telegram notifications carry only the generic alert. Recipient addresses/chat IDs and bot credentials are configured by the business/Launchset.
- No LLM provider receives data in this release. Update the workflow, agreements, notices and data handling answers before enabling one.
- Launchset controls its service administration data; each connected business controls its customer communication purposes. Confirm the legal entity/controller wording appropriate to the exact Meta form instead of blindly pasting this summary.
- John confirmed no national-security disclosures of Meta user data in the preceding twelve months and adopted the four-rule public-authority request procedure on 1 October 2026. These answers come from his explicit responses, not from code or a privacy notice.

## Provider entries saved on 2 October 2026

Meta asks for the legal name, service categories and **all countries where Platform Data is processed, including remote access**. Both provider entries were saved in submission draft `1003787029392740`. After a full reload, reopening each entry returned its expected legal name, IT/cloud service category and exact country list. This verifies draft persistence; John has not approved the final application.

The complete proposed ISO country lists and sources are in [meta-provider-countries.json](meta-provider-countries.json).

- **Cloudflare, Inc.**: Connect Worker execution, D1 event/connection storage, secrets, webhook processing and the Accounting HTTP proxy. The draft selects **135 countries and territories**. This is a conservative proposal based on [default global Worker execution](https://developers.cloudflare.com/workers/reference/how-workers-works/), [published network locations](https://www.cloudflarestatus.com/locations) and applicable [Developer Platform support/storage scope](https://www.cloudflare.com/gdpr/subprocessors/cloudflare-services/). The location page checked on 2 October lists 341 locations and 135 country/territory labels, including mainland China. Mainland China is excluded from this deployment because the separate [Enterprise China Network](https://developers.cloudflare.com/china-network/get-started/) is not configured; Liechtenstein is added for the published EEA support/storage scope. This potential processing coverage is an inference from those sources, not account-specific proof of data visiting every selected country or a residency guarantee. No regional restriction or hosting change was implemented.
- **DigitalOcean, LLC**: Accounting VPS and durable text/document storage. The draft selects **Singapore and United States of America**. The VPS metadata returned `sgp1` on 1 October, matching the [Singapore region](https://docs.digitalocean.com/platform/regional-availability/); the current [applicable service sub-processors](https://www.digitalocean.com/trust/subprocessors) include US infrastructure and support. Optional Cloudways and AI products are not configured. Reassess this declaration if infrastructure, remote access or provider terms change.
- Both entries use the exact category **IT solutions and services, including cloud storage and processing**. Generic Telegram/email alerts contain no WhatsApp sender or message contents. No LLM provider is enabled.

These country declarations remain part of John's full pre-submission review. Saving them did not certify allowed usage, publish the app, deploy production or submit App Review.

## Remaining live gates

- [x] Business verification checked live (still In review; recheck for approval).
- [x] Meta credentials securely installed in the isolated preview (test token; durable production token remains later work).
- [x] New Telegram bot created and its token securely installed in the preview.
- [x] John's private Telegram chat identified and configured after a setup message reaches the bot.
- [x] Actual Meta management calls succeed for the test WABA/phone.
- [x] Meta reports both WhatsApp permission API tests Completed.
- [x] Callback verified and test WABA/messages subscription confirmed.
- [x] Permitted test recipient verified by John.
- [x] Test sender registered by John; sample API send and receipt confirmed.
- [x] Real reply reaches Connect; generic email service accepts its alert.
- [ ] Test sender's exposed registration PIN replaced privately by John.
- [x] Real test message produces an event and a Telegram notification confirmed by John.
- [x] Email alert inbox arrival confirmed by John for the 2 October test.
- [x] Accounting's deployed signed callback accepts fictional text/PDF and deduplicates replay.
- [x] Real Meta text reaches Accounting through Connect and is durably stored in the configured fictional scope.
- [x] Meta test token refreshed and backend-requested text reply accepted by Meta.
- [x] Real Meta document reaches Accounting on its first attempt; PDF bytes and WhatsApp provenance confirmed in storage.
- [x] WhatsApp receipt of the backend-requested reply confirmed by John for the 2 October test.
- [x] Reviewer sign-in and desktop monitor verified in Chrome; live one-business scope and administrator/billing exclusions passed.
- [ ] Mobile layout verified.
- [ ] Final review host/platform, reviewer sign-in, permission scope and screencast prepared.
- [x] Disclosure-history answer and adopted public-authority procedure entered and persistence verified.
- [x] Responsible person/entity and UK country confirmed by John and entered.
- [x] Provider draft names, categories and proposed country lists saved; exact persistence verified after reload.
- [ ] John reviews the provider-country declarations as part of the full application.
- [ ] Exact production release and final Meta submission approved.

References: [Meta Tech Provider overview](https://whatsappbusiness.com/partners/become-a-partner/), [WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/), [Telegram Bot API](https://core.telegram.org/bots/api), [Cloudflare Email Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/). Follow the live app review form for the precise requirements of this submission.
