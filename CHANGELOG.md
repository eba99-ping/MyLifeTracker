# Changelog

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
