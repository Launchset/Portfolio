# Meta reviewer access

John approved a separate email/password test login on 2 October 2026. It is deployed only to the isolated `launchset-connect-shadow` Worker at version `cf674f85-94d3-400e-9075-482c13d66da3`.

## Login and scope

- URL: https://launchset-connect-shadow.jhelyar04.workers.dev/launchset-connect/reviewer
- Username: `meta-reviewer@launchset.dev`.
- Password: generated and retained in the protected local `.credentials/meta-reviewer-login.json`, outside Git. The local file is mode 0600; it is not an encrypted vault. Better Auth stores a salted password hash in `launchset-auth-shadow`.
- Sign-in opens `/launchset-connect/workspace` directly. The member belongs only to the existing **Launchset test workflows** business, using Meta's test WABA and test phone number. Alert destinations, backend routing and live phone registration were not changed.
- This uses the existing verified-email business membership. No new customer permission model, inbox or administrator identity was added. The reviewer has no billing client record.

Only `wrangler.connect-shadow.jsonc` enables `CONNECT_REVIEWER_LOGIN_ENABLED=true` and sets `CONNECT_REVIEWER_EMAIL`. The server requires the exact Connect test origin and rejects using the administrator email as the reviewer identity. Other email addresses cannot use this password sign-in method. Public password sign-up is disabled. The new review route returns not found when the feature is disabled. Disable the flag and remove the test credentials/membership when review access is no longer needed; do not promote these enabling variables to production.

## Verified on 2 October 2026

All 28 Connect tests passed, including production/foreign-origin rejection, administrator-identity rejection and existing two-business member isolation. Lint, TypeScript, Next.js and OpenNext builds passed.

Actual deployed checks returned:

| Check | Result |
| --- | --- |
| Signed-out event API | 401 |
| Wrong reviewer password | 401, no session cookie |
| Unrelated password-login identity | 401 |
| Public password sign-up | 400 |
| Reviewer login | 200, session established |
| Reviewer event API | 200; admin false, one assigned test business, five existing events |
| Administrator business mutation | 403 |
| Administrator page | 404 |
| Billing page | Redirect to access required |
| Unassigned account check | 404 |

The normal-Chrome browser form successfully signed in and opened the delivery monitor. Its rendered page showed only the test business, its five text/document delivery events and member controls. The login and monitor were visually inspected; the monitor had no horizontal overflow at a 1100px viewport. This does not establish mobile-device behaviour or current Meta API-token validity.

## Proposed reviewer instructions

The following is a draft for John's review. Supply the password privately in Meta's reviewer credential field after John approves the exact application; never put it in Git or a recording.

1. Open the reviewer URL and sign in with the supplied review credentials.
2. The Delivery monitor opens with the Launchset test workflows connection. It displays routing labels, message types and email/Telegram/backend delivery results. It does not display a customer's conversation or file content.
3. Click **Check Meta access** to validate the configured test WABA/phone pair through the backend's `whatsapp_business_management` call. A valid test token is required.
4. Use the supplied demonstration recording for the actual permitted-recipient WhatsApp send, generic alert receipt, Accounting text/document storage and backend-requested reply. The current test sender is `+1 555-163-2129`; a new reviewer phone is not automatically an approved test recipient.
5. The member can update a monitor event's routing label/status. Such an edit does not replay historical deliveries or change the deployed backend routing rules.

The temporary Meta token was refreshed on 2 October and the deployed account check returned 200 / checked; it expires at 09:00 UTC that day. Before submission, provide credentials valid for the review period, record the real workflows, and configure the agreed Website platform/reviewer instructions in Meta. Account creation and sign-in verification do not mean App Review is ready or submitted.

John confirmed receipt of today's email alert, Telegram alert and backend-requested WhatsApp reply on 2 October. Accounting storage of the matching text and 240,204-byte PDF was independently verified. The recording itself is still pending.

See the [recording plan](meta-review-recording.md) for the first reviewer-access clip and the remaining message-workflow evidence.
