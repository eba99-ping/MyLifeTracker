# Closed-app reminder release gate

The frontend can register an FCM device and send its planner/class schedule to the owner's private reminder registry. **A registered token is not evidence that a background sender is deployed or that a device displayed a notification.**

No billing upgrade or backend deployment is included in the v2.15 frontend release. Firebase Console currently requires the owner to reauthenticate before the plan/deployment can be checked.

1. Owner signs in to Firebase Console for `my-life-tracker-6c19b`.
2. Read the current billing/deployment status. If a Blaze upgrade or other paid resource is needed, obtain explicit approval with expected costs first; do not enable billing automatically. Scheduled Functions use Cloud Scheduler and may incur usage costs.
3. Review the existing Firestore owner-only rules and backend tests (`npm run check:functions`). Do not replace rules with public access.
4. After billing is authorized/configured, deploy only the reminder sender using the owner's existing Firebase CLI login: `firebase deploy --only functions:sendSmartReminders --project my-life-tracker-6c19b`. Deploy the checked-in rules separately only if they differ from the current rules and the changes have been reviewed.
5. Verify the scheduler exists in `asia-northeast1`, runs every minute, and has the intended service-account permissions. Do not expose its invocation URL publicly.
6. On the target device, open `https://temuul.vercel.app`, sign in, grant notification permission and enable reminders. On iPhone use the installed Home Screen web app. Permission must be granted by the user.
7. Create a disposable reminder 3–5 minutes ahead. Fully close the app, wait, and confirm the actual device displays it. Reopen through the notification, check the correct account/task, and verify no duplicate appears on the next scan.
8. Repeat with a recurring task, timezone/day boundary and a completed task (which should not notify). Confirm invalid tokens are pruned. Record actual test date/device and the corresponding registry `lastDelivery` outcome without exporting tokens.
9. Keep old production aliases working: local-only data does not migrate between origins automatically. Reminders now link to the `temuul.vercel.app` origin.

References: [Scheduled functions](https://firebase.google.com/docs/functions/schedule-functions), [Firebase billing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).
