# Story 4 work breakdown

Base: `story-4`, created from `story-3`. Each task branch is merged with a merge commit so its scope remains visible in history.

1. `codex/story-4-auth`: validation, Firebase adapter, Email/Password registration and login, Google popup, pending locks and error recovery (4-1-1 through 4-1-4). Includes the shared session core required by authentication.
2. `codex/story-4-session`: profile and avatars, five-minute session recovery/expiry, logout, URL guards and dialog restoration (4-3-1 through 4-3-4).
3. `codex/story-4-interactions`: personalized reads, favorites, comment creation, stable avatar colors and comment likes (4-2-1 through 4-2-4).
4. `codex/story-4-tests`: Vitest tooling, behavior tests, project-wide coverage and final verification (4-4-1 through 4-4-4).
5. `codex/story-4-integration`: browser verification, stable accessible field names, CI checks and setup/verification notes.
6. `codex/story-4-auth-transitions`: clear switched forms synchronously, preventing stale form submission during tab animations.
7. `codex/story-4-firebase-setup`: restore Firebase access, configure Authentication and local Web app parameters, and verify live registration/login.

The final cross-check comparison is `story-4` → `story-3`; leave that PR unmerged.

## External setup

The `MiniGames` project (`minigames-c1888`, project number `957623056036`) and its `MiniGames Web` app are active. Firebase Authentication has been initialized on the free Spark plan, and Email/Password and Google sign-in are enabled. The Google provider uses the public app name `MiniGames` and the project owner's support email.

Authorized domains include `localhost`, `127.0.0.1`, `romasho.github.io`, `minigames-c1888.firebaseapp.com` and `minigames-c1888.web.app`. Official CLI/API reads confirm these settings independently of the intermittently failing embedded console. The verified Web SDK parameters are saved in the ignored `.env.local`; production builds require the same variables at build time.

Live checks passed for Email/Password registration, profile updates, login, incorrect-password rejection and Web SDK logout. Browser checks also passed for login through the application, displaying the profile name, session recovery after reload and logout. Temporary test accounts and their local credentials were removed. The Google provider's OAuth endpoint returns the expected Google authorization URL, but a full Google popup login in the embedded browser failed with a network error and remains unverified. Automated tests mock Firebase and HTTP boundaries.

## Verification

- 81 behavior tests pass; project-wide statement coverage is 96.50%, with no source files excluded.
- Typecheck, ESLint, Prettier and the production build pass.
- Browser checks cover live public data, validation, Auth URL updates, guest action guards and live Email/Password login/session/logout. Full Google popup login remains unverified as described above.
- All task branches are merged locally into `story-4`. The cross-check branch is not merged into `story-3`.
