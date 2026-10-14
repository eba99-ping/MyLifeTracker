# Admin and AI rollout

## Deployment blockers

- Firebase project was verified on Spark on 2026-10-12. The owner must approve/activate Blaze before deploying scheduled reminders and callable admin functions. No billing changes have been made.
- Firebase CLI authorization completed on 2026-10-14. Production v2.3.3 was verified on the canonical domain, and live AI returned a valid response.
- The owner-confirmed account was matched to a verified, enabled Firebase Authentication user. Its admin claim was assigned and read back as true on 2026-10-14. No email, UID or credential is stored in this document.
- Cloud Billing API returned `billingEnabled:false` on 2026-10-14. Admin callable and scheduled-reminder deployment remain blocked pending owner billing approval.

## Secure role setup

Use the Firebase Admin SDK in a trusted owner-controlled environment to look up the verified account with `getUserByEmail`, review its UID, and merge `{admin:true}` into its existing custom claims with `setCustomUserClaims`. Never put service-account keys, admin passwords, or an email-based privilege switch in the frontend. Refresh the account ID token afterward. `functions/scripts/admin-role.cjs` supports explicit inspect/grant operations using an already-approved local CLI session; it never prints access or refresh tokens. Role assignment does not deploy the callable backend.

Deploy `functions:listAdminAccounts`, `functions:sendSmartReminders` and the existing Firestore rules only after owner approval and authentication. Visit `/admin.html` to log in. Non-admin users receive permission-denied; a fresh server-side role lookup also blocks revoked admins. Listings contain only name/email, UID, creation/sign-in dates and account status; never passwords, tokens, Journal, AI conversations or Money data. All successful listing requests require an audit entry. Existing deny-by-default Firestore rules keep audit entries inaccessible to clients.

## AI

Production returned Gemini 503 UNAVAILABLE/high demand during a synthetic test on 2026-10-13. This is not evidence of a phone connectivity problem. Transient 502/503/504 responses now get one retry; quota responses do not retry. Requests are size-limited, provider requests time out, client requests stop after 35 seconds, and provider internals are not returned/logged. Keep GEMINI_API_KEY server-only. GEMINI_MODEL can override the existing model without a code edit; the default model has not been silently changed.

## Manual release checks

- Confirm the live release footer, service worker cache and pet artwork match this commit.
- Test admin as signed-out, ordinary user, assigned admin and revoked admin; check next-page behavior and account switching. Confirm no hashes, tokens or private content appear in responses.
- Test real AI success, overloaded provider, quota exhausted, offline and repeated submissions. Unit tests mock the provider; they do not prove live capacity.
- On an installed iPhone app with notification permission, create a reminder a few minutes ahead, close the app, lock the phone and verify exactly one delivered notification and tap-to-open. Local Test notification is not proof of scheduled server delivery.
