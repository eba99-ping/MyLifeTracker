# Өрнөл v2.1 test checklist

## Study timetable and Google login

- [ ] Confirm the Study page shows seven days and seven numbered periods.
- [ ] Tap an empty cell and confirm its day, start time and end time prefill the class form.
- [ ] Save a class and confirm it appears in the correct timetable cell and day list.
- [ ] Tap an occupied timetable cell and confirm the existing class opens for editing.
- [ ] Confirm room/teacher, weekly hours, subject cards and reminders update after editing.
- [ ] Confirm the timetable scrolls inside its card at 320 px without page-level horizontal overflow.
- [ ] Confirm the production domain is in Firebase Authorized Domains and Google provider is enabled.
- [ ] Test Google popup login on desktop, Android Chrome, iOS Safari and the installed PWA.
- [ ] Confirm cancelled/blocked popup errors show a useful Mongolian message without breaking Device Mode.

## Habit Lab

- [ ] Add a custom habit with selected weekdays and reload to confirm persistence.
- [ ] Add a quick-start template and confirm duplicate template taps open the existing habit.
- [ ] Complete today's habit and confirm streak, heatmap, Today progress and +8 Pet XP update once.
- [ ] Uncheck/re-check the same occurrence and confirm XP is not awarded twice.
- [ ] Confirm Weekly Review and AI Coach context reflect the last seven days.
- [ ] Confirm Habit Lab syncs through Backup/Restore and account Cloud Sync.

## Brand and Study Hub

- [ ] Confirm the Өрнөл logo, name, tagline and v2.1.0 version appear on auth, header, footer, manifest and install UI.
- [ ] Add a class with teacher, room/link, color and two or more selected weekdays; reload and confirm it persists.
- [ ] Edit and delete a class; confirm Today, weekly hours, next class and subject cards update.
- [ ] Add an assignment with subject, due date and priority; edit, complete and delete it.
- [ ] Confirm completing an assignment awards AI Pet XP exactly once.
- [ ] Start the 25-minute Study Focus shortcut and confirm Focus Mode receives the selected subject.
- [ ] Confirm today's classes and pending assignments appear in dashboard and AI Coach context.
- [ ] Confirm Study Hub works at 320 px and in both light/dark themes.

## Cloud Push backend

- [ ] Run `npm run check:functions` and confirm all schedule tests pass.
- [ ] Deploy `firestore.rules` and confirm a user can access only their own `reminderUsers/{uid}` registry.
- [ ] Sign in, enable Cloud Push and confirm timezone, sanitized tasks/classes and token sync to the registry.
- [ ] Confirm `sendSmartReminders` runs every minute and sends one notification per due occurrence.
- [ ] Confirm Daily, Weekdays, Weekly and selected-day class schedules fire only on matching dates.
- [ ] Confirm invalid FCM tokens are removed and the scheduler does not resend an already claimed occurrence.
- [ ] Sign out and confirm the reminder registry is disabled for that user.

## Smart Reminders

- [ ] Create a task with a reminder time and confirm it appears immediately in Smart Reminders.
- [ ] Edit the task and confirm reminder time, priority and repeat schedule persist after refresh.
- [ ] Test Once, Daily, Weekdays and Weekly schedules on matching and non-matching days.
- [ ] Press Enable from a user gesture, allow notifications, and confirm the ready notification appears.
- [ ] Press Test and confirm a branded system notification appears once.
- [ ] Set a due reminder and confirm it appears once without duplicate system notifications.
- [ ] Press +10 мин and confirm the reminder moves forward by ten minutes.
- [ ] Press Done and confirm the correct task occurrence completes and Life Insights/Pet update.
- [ ] Close/reopen within 12 hours of a missed reminder and confirm recovery is shown.
- [ ] Click a notification and confirm the existing app window focuses on Today.
- [ ] Confirm reminder controls fit at 320 px and work in light/dark themes.
- [ ] Confirm blocked/unsupported permission states show helpful UI without crashing.

## Life Insights

- [ ] Confirm the dashboard shows a Life Score, four weekly metrics and a seven-day chart.
- [ ] Complete/uncomplete tasks and finish a Focus session; confirm the dashboard updates immediately.
- [ ] Add journal moods on multiple days and confirm weekly and monthly mood values update.
- [ ] Create an overdue or behind-schedule goal and confirm its health badge and next step are correct.
- [ ] Add High, Medium and Low priority tasks and confirm they sort before normal tasks.
- [ ] Confirm AI Pet highlights a High-priority task or At-risk goal when relevant.
- [ ] Confirm AI Coach requests still succeed and receive the expanded tracker context.
- [ ] Confirm Life Insights is readable at 320 px in light, dark and reduced-motion modes.

## Focus Mode

- [ ] Open Tools → Focus Mode and confirm 15, 25 and 45-minute presets work.
- [ ] Link a pending task, start, pause and resume; confirm the countdown survives refresh.
- [ ] Finish after at least one minute and confirm the session appears in recent history.
- [ ] Complete at least 15 minutes and confirm AI Pet XP is awarded exactly once.
- [ ] Confirm today's minutes, session count, focus streak and seven-day chart update.
- [ ] Confirm Focus sessions persist through Backup & Restore and Cloud Sync.
- [ ] Confirm the running timer and dashboard work in light/dark themes and at 320 px width.

## Cloud Sync

- [ ] Enable Firestore and deploy `firestore.rules`; confirm test-mode public access is not enabled.
- [ ] Sign in on device A, press Sync now and confirm the status becomes Synced.
- [ ] Sign in with the same account on device B and confirm Planner, Goals, Journal, Money, Pet and Quests appear.
- [ ] Make different changes on both devices and confirm the merge keeps both records and XP awards.
- [ ] Delete a task, goal, journal entry and transaction; confirm deleted items do not return after sync.
- [ ] Go offline, make a change, reconnect and confirm the pending change syncs automatically.
- [ ] Confirm another Firebase user cannot read or write the first user's document.

## Daily Quests

- [ ] Confirm exactly three quests are generated for the local calendar day.
- [ ] Complete a task and a goal step; confirm their quest progress becomes claimable.
- [ ] Complete the rotating third quest and claim all three rewards.
- [ ] Confirm a reward cannot be claimed twice after unchecking, re-checking or reloading.
- [ ] Confirm quest state and XP persist after reload, Backup & Restore and cloud sync.

## Data and regression

- [ ] Open an existing user profile and confirm Planner, Goals, Journal and Money data remains unchanged.
- [ ] Confirm Firebase Google and Email authentication still signs in on the production domain.
- [ ] Confirm Device Mode, logout, profile editing, Backup and Restore continue to work.
- [ ] Confirm AI Coach still receives responses through `/api/chat`.
- [ ] Confirm PWA install and offline app-shell reload work after upgrading the service worker.

## AI Pet

- [ ] Confirm an existing user receives migration-safe starting XP without modifying existing tracker data.
- [ ] Rename the pet, reload, and confirm the name persists.
- [ ] Complete a task and confirm task XP plus one daily streak bonus is awarded.
- [ ] Uncheck and re-check the same task and confirm XP is not awarded twice.
- [ ] Complete a goal step and a goal; confirm +20 XP and +100 XP are awarded once.
- [ ] Confirm level and XP progress update immediately.
- [ ] Confirm mood and speech change with time, completed tasks and active/overdue goals.
- [ ] Click the pet and confirm the existing AI Coach opens and receives focus.
- [ ] Confirm accessories unlock at levels 2, 3, 5 and 7 and the selected accessory persists.
- [ ] Export and restore a backup and confirm pet name, XP, level and accessory return.

## Responsive and accessibility

- [ ] Test 320 px, 375 px, tablet and desktop layouts with no horizontal overflow.
- [ ] Test both light and dark themes.
- [ ] Enable reduced motion and confirm pet animation is disabled.
- [ ] Confirm pet controls work with keyboard focus and have accessible names.
