# My Life Tracker v1.2 test checklist

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
