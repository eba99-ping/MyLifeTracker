# Changelog

## v2.7.0 — Spectrum

- Replaced the flat indigo palette with a forest/mint base, apricot actions, sky-blue Focus direction and lilac Pet accents in both themes.
- Gave shortcuts, progress, Pet and daily direction distinct tinted surfaces; added a small sunrise accent and color-coded agenda edges without adding scrolling or changing navigation.
- Updated the offline shell. No storage, authentication, AI or tracker logic changes.
- QA: run the complete regression suite; inspect Today/Pet in both themes at 390 px and verify no horizontal overflow at 320 px/desktop.

## v2.6.1 — Companion moments & daily direction

- Added petting, feeding and play with gentle, reduced-motion-aware reactions and cooldowns; care never consumes real money or penalizes inactivity.
- New work earns pet coins once per activity. Five purchasable environments/props keep all existing level unlocks and appearance settings intact. Historical XP is preserved without retroactive coin grants.
- Added a compact next-action card using time, priority, due assignments/goals and yesterday's chosen priority. One click starts Focus or opens an existing session without replacing it.
- Added a two-question evening review. Tomorrow's priority appears automatically on Today without creating duplicate Planner records. Reviews merge independently by date; coins and purchases merge deterministically across devices.
- Included new assets in the versioned offline shell and added economy/review/ranking regression checks.

### Test checklist

- Complete a new task: +5 coins once; undo/re-complete does not duplicate coins. Existing XP, Journal, Money, Study and Games survive reload.
- Pet, feed and play: distinct feedback, brief cooldown, no coin farming; pet portrait still opens AI Coach.
- Earn enough coins, buy/equip an environment and prop, reload and verify persistence. Insufficient funds disable purchase; two offline purchases cannot produce a negative balance.
- Save/edit an evening review, reload, then check the next local day's priority. Editing never creates Planner duplicates; cloud merge retains reviews on different dates.
- Check overdue/timed/high-priority recommendations; start Focus twice and verify the active session is preserved.
- Check 320/390 px and desktop, both themes, keyboard controls and reduced-motion mode. New assets are included in the PWA cache.

## v2.5.1 — Small-screen game polish

- Kept all three game statistics on one row on narrow phones and aligned back/restart controls under the game title.
- Removed an empty library spacer and return new rounds to the page top so the header remains reachable.
- Verified complete memory, reaction and puzzle rounds in the live UI; best scores survived reload.

## v2.5.0 — Little Games

- Added a dedicated Games tab with three offline games: animal-pair memory, three-trial reaction speed and a solvable illustrated 3×3 sliding puzzle.
- Added local personal bests, clear rules, restart/back controls, keyboard/touch support, status announcements and reduced-motion layouts.
- Interrupted rounds stop their timers and return to the game library; results are saved once on completion. No changes to existing pet XP or tracker records.
- Included game code, illustrated puzzle artwork and styling in the offline shell. Six bottom buttons retain touch targets on small phones.

## v2.4.2 — Mobile Pet and iPhone header fixes

- Removed a leaked named-grid placement from Daily Quests that created implicit columns and squeezed the Pet card to a thin line on mobile.
- Constrained Pet page children to their actual tracks while keeping the character, speech and customization controls visible.
- Added iOS safe-area top spacing to the app, login and modal overlays, a status-bar backdrop and 44 px header controls.
- Bumped the stylesheet/offline cache version so installed PWAs fetch the corrected layout. No pet data or XP changes.

## v2.4.1 — Less scrolling, a dedicated Pet tab

- Added a fifth primary navigation tab: Today, Planner, Study, Pet, Tools.
- Moved the full pet profile, appearance controls, unlocks and Daily Quests into a dedicated Pet page with refresh-safe routing.
- Kept only a small live pet portrait/name/level shortcut on Today; compressed daily shortcuts, progress and reminders so tasks appear sooner.
- Moved weekly insights and habit overview to Tools → Миний ахиц; all existing stats, XP and user data are retained.
- Added a Pet PWA shortcut and refreshed the offline cache.

## v2.4.0 — A calmer daily workspace

- Reorganized Today around a welcome, three useful shortcuts, daily progress and tasks; pets, habits, reminders, quests and insights now have clear secondary areas.
- Added a two-column desktop dashboard, single-column mobile flow and a desktop side navigation at wide viewports.
- Unified backgrounds, card borders, spacing, buttons, forms and typography across Planner, Study, Tools, Journal, AI, Money and modals in light/dark mode.
- Refreshed the login welcome, added an illustrated daily-progress preview and localized the Today date.
- Made the reminder center expandable while leaving its summary visible; retained all existing reminder controls and IDs.
- Updated PWA cache and manifest colors. Existing storage keys, auth, Firebase access and feature logic remain unchanged.

## v2.3.3 — AI resilience and protected admin foundation

- Diagnosed production AI failures as provider 503 overload; added one bounded transient retry, request size validation, provider/client timeouts and safe localized error messages.
- Added `/admin.html` and a callable, server-role-checked paginated account listing with audit records. Private Journal, AI chat and Money contents are not exposed.
- Admin pages bypass offline cache; no admin role is assigned automatically. Backend deployment, billing approval and admin identity verification remain required (see ADMIN_SETUP.md).

## v2.3.2 — Animal companions

- Replaced round mascot bodies with separate quadruped silhouettes: slender curled-tail cat, broad bear with short tail, and rabbit with large hindquarters and cotton tail.
- All three have four paws, a distinct head and coordinated fur, ear, belly and paw colors derived from the selected color.
- Added five fur palette shortcuts to the non-saving live preview; custom colors remain available.
- Kept accessories, mood animation, reduced motion, XP, levels and existing data unchanged.

## v2.3.1 — Companion polish

- Redesigned bunny, bear and cat as lightweight shaded vector characters with paws, expressive eyes and fitted vector accessories instead of floating emoji.
- Added live customization preview for name, shape, color and environment; previews never mutate saved pet state.
- Avoid rebuilding the dashboard SVG unless its appearance changes, preserving smooth animation. Existing reduced-motion support remains active.
- Preserved pet storage keys, XP, levels and cloud data. Firebase CLI still has no authorized account; background server deployment remains blocked.

## v2.3.0 — Pet Studio

- Customize pet name, bunny/bear/cat shape, body color and four environments; preserve existing local/cloud pet records and XP.
- Unlock a new accessory at every level from 2–10, with level-up messages and visible next-reward progress. Levels above 10 continue every 550 XP with numbered master titles.
- Fix four-button bottom navigation wrapping and clipping on phones.
- Return the background notification promise so the worker can finish displaying it. Add branded server reminder titles and a ten-minute push TTL.
- Show “Push registered” rather than implying that a saved device token proves background delivery.
- Firebase scheduled-function deployment and real iPhone closed-app delivery remain unverified: Firebase CLI is not signed in on this machine. No billing changes were made.
- Automated checks cover legacy pet migration, appearance validation, level thresholds, duplicate XP, Google auth and reminder scheduling.

## v2.2.0 — Тэмүүл Rise

- Google popup starts directly in the tap handler after Firebase has loaded; cold loads ask for a fresh tap, failed SDK loads can retry, and repeated taps cannot cancel an active attempt.
- Installed-app login failures expose the Firebase error code and a Safari fallback explanation. Real iOS Home Screen sign-in still requires device verification.

- Renamed the product from Өрнөл to Тэмүүл with the tagline “Өдөр бүр өөдөө.”
- Added a new transparent brand mark combining an ascending path, subtle T silhouette and north-star spark.
- Refreshed header, login, boot screen, footer, metadata, legal pages, PWA manifest, install icons, notifications, social preview and offline cache branding.
- Preserved all user data keys, Firebase documents, auth behavior and feature logic.

## v2.1.0 — Momentum

- Added an interactive seven-day, seven-period Study timetable with click-to-prefill class creation.
- Kept timetable cells, per-day class lists, weekly hours and reminders synchronized from one migration-safe class record.
- Added Habit Lab with custom schedules, quick templates, daily completion, streaks, 28-day heatmap and weekly review.
- Added duplicate-safe +8 AI Pet XP for each habit occurrence and linked habit context to Today, Life Insights and AI Coach.
- Replaced mobile Google redirect auth with popup auth to avoid third-party storage failures on Vercel-hosted browsers.
- Confirmed the production Vercel domain is present in Firebase Authorized Domains and Google auth URI generation succeeds.
- Preserved all v2.0 data, Firebase Auth, Cloud Sync, Planner, Goals, Journal, Money, Focus, PWA and reminder behavior.

## v2.0.0 — Өрнөл Final Edition

- Rebranded the app as Өрнөл with a new generated logo, tagline, metadata, PWA identity and social preview.
- Added a complete Study Hub with multi-day class schedules, teachers, rooms/links, colors and cloud reminder controls.
- Added assignments with subjects, due dates, priorities, completion state and duplicate-safe AI Pet XP rewards.
- Added Study summaries to the dashboard, AI Coach context and contextual reminder messages.
- Added a private per-user reminder registry and a scheduled Firebase backend for closed-app FCM delivery.
- Added timezone-safe selected-day scheduling, duplicate claims, token cleanup and automated reminder-logic tests.
- Updated legal pages, deployment documentation, cache identity and production verification markers.
- Preserved all Firebase Auth, Planner, Goals, Journal, Money, Focus, AI Pet, Quests, PWA and legacy localStorage data.

## v1.5.0 — Smart Reminders

- Connected the task reminder time field to real task data, cloud sync and backup/restore.
- Added a dashboard Reminder Center with permission state, Test, upcoming/due/missed items, Snooze and Done actions.
- Added duplicate-safe reminder delivery with 12-hour missed-reminder recovery when the app is reopened.
- Switched local notifications to service-worker `showNotification()` for better installed-PWA and mobile support.
- Added notification click handling that focuses the app and supports a 10-minute snooze action.
- Added Daily, Weekdays and Weekly task schedules with migration-safe defaults for existing tasks.
- Added optional Firebase Cloud Messaging device registration using the existing public VAPID configuration.
- Unified foreground and background push presentation and retained the legacy FCM worker for old installations.
- Increased reminder checks to resume on focus, visibility and page restore without duplicate notifications.
- Preserved Firebase Auth, Cloud Sync, Planner, Goals, Journal, Money, Focus, Life Insights, AI Pet and user data.

## v1.4.0 — Life Insights

- Added a dashboard Life Score and seven-day task/focus activity chart.
- Added weekly task completion, focus minutes, healthy goals and average mood metrics.
- Added High, Medium and Low planner priorities with priority-first sorting.
- Added goal health signals (On track, Attention and At risk) plus the next unfinished step.
- Added a five-level Journal mood check-in with monthly average mood statistics.
- Added context-aware weekly coaching that considers priorities, goal risk, mood, focus and spending.
- Extended AI Coach context with task priority, goal health, next steps and the weekly Life Insights summary.
- Updated AI Pet speech to surface high-priority tasks and at-risk goals.
- Preserved all existing storage keys, account-scoped cloud sync, migrations and v1.3 functionality.

## v1.3.0 — Focus Mode

- Added a mobile-first 15/25/45-minute focus timer linked to today's tasks.
- Added pause, resume, finish and cancel flows with refresh-safe active session recovery.
- Added daily minutes, session count, focus streak, seven-day activity chart and recent history.
- Added duplicate-safe AI Pet XP rewards for focus sessions of at least 15 minutes.
- Added Focus data to Backup & Restore, AI Coach context and account-scoped Cloud Sync.
- Added migration-safe persistence in `myLifeTracker.focus.v1` without changing existing storage keys.
- Added a Focus Mode PWA shortcut and complete light/dark/reduced-motion support.
- Preserved Firebase Auth, Planner, Goals, Journal, Money, Daily Quests, AI Pet and the existing AI backend.

## v1.2.0 — Cloud Sync + Daily Quests

- Added three deterministic Daily Quests with visible progress and one-time XP claim rewards.
- Added quest rotations for tasks, goal steps, journals, tomorrow planning and goal completion.
- Added migration-safe quest persistence in `myLifeTracker.quests.v1` and Backup & Restore support.
- Added account-scoped Firestore sync for Tracker, Profile, Money, Journal, AI Pet and Daily Quests.
- Added conflict-aware merges, deletion tombstones, debounced saves, manual Sync Now and offline retry.
- Added merge-safe pet XP award ledgers so rewards from different devices are not lost or duplicated.
- Added private-by-default Firestore rules and Firebase deployment metadata.
- Preserved Device Mode, all existing local keys, Firebase Auth, PWA and the existing AI backend.

## v1.1.0 — AI Pet

- Added a dashboard AI Pet that opens the existing AI Coach when clicked.
- Added customizable pet name with migration-safe state in `myLifeTracker.pet.v1`.
- Added XP and levels for task completion, goal steps, completed goals and daily streaks.
- Added duplicate-safe XP event tracking, including credit for activity completed before this update.
- Added happy, sleepy, motivated and neutral moods with contextual planner/goal messages.
- Added pet profile with XP progress, level, mood and streak bonus.
- Added unlockable sprout, star, crown and headphones accessories at levels 2, 3, 5 and 7.
- Added pet data to Backup & Restore and AI Coach context.
- Added mobile-first, reduced-motion-safe animation and complete light/dark theme styling.
- Preserved Firebase Auth, Planner, Goals, Journal, Money, PWA and the existing `/api/chat` backend.
