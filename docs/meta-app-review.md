# Meta review preparation

App: Launchset Connect (`1003785039392939`). Business: John Helyar trading as Launchset. Business portfolio: `786110224586080`.

Last confirmed business verification: **In review**. Domain ownership: `launchset.dev` verified. App Review: **Not submitted**. Refresh these statuses in Meta before submission.

## Preview validation on 1 October 2026

Preview: https://launchset-connect-shadow.jhelyar04.workers.dev/launchset-connect

The isolated Worker was deployed successfully and migration `0005_launchset_connect.sql` was applied to `launchset-app-shadow`. The existing Launchset production Worker and shared `launchset-shadow` Worker were not deployed. A new authentication secret was installed only in the Connect preview.

Lint, TypeScript, the Next.js production build and the Cloudflare runtime build passed. All 13 SQLite/provider integration checks passed. In the shared signed-out browser, the product/privacy/terms pages returned 200, the private inbox API returned 401, business changes returned 403 and unconfigured webhook requests returned 503. All seven responses carried noindex headers, and navigating to the workspace redirected to sign-in. The public page was visually inspected in Chromium.

Meta and Telegram credentials remain unconfigured. A new Telegram bot has not been created. Actual provider delivery, the signed-in workspace, mobile presentation and Meta account access remain unverified. The initial approved Chrome tab closed during Telegram setup; a replacement browser upgrade request is pending John's decision. These checks establish the deployed application boundaries, not end-to-end WhatsApp functionality or review readiness.

## First-release description

Launchset Connect helps authorised businesses receive and organise alerts for incoming WhatsApp Business messages. The business chooses its email and Telegram destinations and uses a private workspace to track new, in-progress and completed work. Notification services receive a generic alert without customer names, numbers or message content. Launchset administers connections; each verified business member has access only to their assigned businesses.

No LLM, automatic customer reply, bulk campaign or cross-customer message forwarding is enabled in this release. Chatbots and direct booking/support/accounting actions are future plans. Tell reviewers what is implemented, not what the roadmap may later include.

## Permission evidence

| Permission | Intended first-release use | Required evidence still to capture |
| --- | --- | --- |
| `whatsapp_business_management` | Read the authorised WABA phone list and validate that the selected phone belongs to that account. | Actual successful management API call and screencast of the account check. |
| `whatsapp_business_messaging` | Receive incoming message events for the connected business and trigger its chosen alert workflow. | Actual signed message webhook, inbox entry and real notification delivery. Check Meta's current permission review text/test-call requirements; if it additionally requires sending, resolve that gap honestly before submission. |
| `public_profile` | Only if required by the selected Facebook Login for Business/Embedded Signup configuration. | Reassess this request before submission: first-release workspace login uses Google or email, and Embedded Signup is not yet implemented. Remove unnecessary permissions rather than claiming unused functionality. |

These are draft explanations, not completed certifications. API tests must be made with the actual app/test assets; simulated SQLite or provider fixtures do not count as Meta API evidence.

## Reviewer access and recording

1. Add the appropriate Website platform and URL in Meta. The last inspected reviewer-instructions page said no app platforms were configured.
2. Provide a dedicated verified reviewer member email for a test business. Do not give out John's personal Meta/Google account or admin credentials. Agree a workable sign-in procedure with the reviewer before submission; a private magic-link inbox is not usable without access.
3. Record the actual release on its final review host, showing business context, Meta account access check, receipt of a permitted test message, website alert, email/Telegram delivery, routing-label change and work-status change. Avoid showing any secrets or unrelated personal/client messages.
4. Explain that routing labels organise the follow-up work and that actual replies remain in WhatsApp Business. Do not show a simulated chatbot or suggest LLM replies are live.
5. Review allowed usage for each requested permission, upload the screencast and confirm the required successful API tests in Meta.
6. Submit only after all Meta steps are complete, the reviewed version is deployed to an approved review URL, and John has reviewed the exact final submission.

## Data handling draft facts

- Cloudflare hosts the service and stores backend secrets, connection settings and 30-day technical event/delivery records.
- The Meta webhook body may transiently contain customer data. This release discards customer names, phone numbers, message text and media rather than storing them.
- Email/Telegram notifications carry only the generic alert. Recipient addresses/chat IDs and bot credentials are configured by the business/Launchset.
- No LLM provider receives data in this release. Update the workflow, agreements, notices and data handling answers before enabling one.
- Launchset controls its service administration data; each connected business controls its customer communication purposes. Confirm the legal entity/controller wording appropriate to the exact Meta form instead of blindly pasting this summary.
- Public-authority disclosure history and internal request-handling policies need John's actual answers. Do not assume these from code or from a drafted privacy notice.

## Remaining live gates

- [ ] Business verification result checked.
- [ ] Meta credentials securely installed in the isolated preview.
- [ ] New Telegram bot created, started by John and securely configured.
- [ ] Actual Meta management call succeeds for the test WABA/phone.
- [ ] Callback verified and WABA/messages subscription confirmed.
- [ ] Real test message produces one private alert and actual email/Telegram notifications.
- [ ] Signed-in browser review, mobile layout and member isolation verified.
- [ ] Final review host/platform, reviewer sign-in, permission scope and screencast prepared.
- [ ] Accurate data handling answers confirmed.
- [ ] Exact production release and final Meta submission approved.

References: [Meta Tech Provider overview](https://whatsappbusiness.com/partners/become-a-partner/), [WhatsApp Business Messaging Policy](https://whatsappbusiness.com/policy/), [Telegram Bot API](https://core.telegram.org/bots/api), [Cloudflare Email Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/). Follow the live app review form for the precise requirements of this submission.
