# Story 4 work breakdown

Base: `story-4`, created from `story-3`. Each task branch is merged with a merge commit so its scope remains visible in history.

1. `codex/story-4-auth`: validation, Firebase adapter, Email/Password registration and login, Google popup, pending locks and error recovery (4-1-1 through 4-1-4). Includes the shared session core required by authentication.
2. `codex/story-4-session`: profile and avatars, five-minute session recovery/expiry, logout, URL guards and dialog restoration (4-3-1 through 4-3-4).
3. `codex/story-4-interactions`: personalized reads, favorites, comment creation, stable avatar colors and comment likes (4-2-1 through 4-2-4).
4. `codex/story-4-tests`: Vitest tooling, behavior tests, project-wide coverage and final verification (4-4-1 through 4-4-4).
5. `codex/story-4-integration`: browser verification, stable accessible field names, CI checks and setup/verification notes.
6. `codex/story-4-auth-transitions`: clear switched forms synchronously, preventing stale form submission during tab animations.
7. `codex/story-4-firebase-setup`: verify the existing cloud project and Authentication configuration, prepare local Web app parameters, and document the remaining external setup.

The final cross-check comparison is `story-4` → `story-3`; leave that PR unmerged.

## External setup

The `MiniGames` project (`minigames-c1888`, project number `957623056036`) exists in Google Cloud and appears in the Firebase project list after refreshing the Google account session. Firebase Management API and Identity Toolkit API are enabled. The Firebase Console still alternates between a terms-status loading error and a project/app permission error when opening the project.

The public Authentication configuration endpoint returns `CONFIGURATION_NOT_FOUND`, so Authentication initialization and provider settings remain unfinished. Web app parameters have been saved locally in the ignored `.env.local`; a production build with those parameters passes. Live sign-in has not been verified. An official Firebase CLI login is prepared as a fallback, pending the account owner's approval of its Google Cloud/Firebase access. Automated tests mock Firebase and HTTP boundaries.

## Verification

- 81 behavior tests pass; project-wide statement coverage is 96.50%, with no source files excluded.
- Typecheck, ESLint, Prettier and the production build pass.
- Browser checks cover live public data, validation, Auth URL updates and guest action guards. Live Firebase sign-in remains unverified because of the console error above.
- All task branches are merged locally into `story-4`. The cross-check branch is not merged into `story-3`.
