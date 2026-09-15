# Changelog

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
