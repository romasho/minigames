# Story 4 work breakdown

Base: `story-4`, created from `story-3`. Each task branch is merged with a merge commit so its scope remains visible in history.

1. `codex/story-4-auth`: validation, Firebase adapter, Email/Password registration and login, Google popup, pending locks and error recovery (4-1-1 through 4-1-4). Includes the shared session core required by authentication.
2. `codex/story-4-session`: profile and avatars, five-minute session recovery/expiry, logout, URL guards and dialog restoration (4-3-1 through 4-3-4).
3. `codex/story-4-interactions`: personalized reads, favorites, comment creation, stable avatar colors and comment likes (4-2-1 through 4-2-4).
4. `codex/story-4-tests`: Vitest tooling, behavior tests, project-wide coverage and final verification (4-4-1 through 4-4-4).

The final cross-check comparison is `story-4` → `story-3`; leave that PR unmerged.

## External setup

Firebase Console initially required account MFA. After MFA and explicit consent to the Firebase terms, the console reported `MiniGames` (`minigames-c1888`) and its Web app as created. However, saving Email/Password did not finish, and reloading then reported a missing project / unavailable terms status. No working provider configuration or live login has been verified. Do not treat the temporary console success screen as proof of completed Firebase setup. Follow the README setup steps once account/project access is restored; automated tests mock Firebase and HTTP boundaries.

5. `codex/story-4-integration`: browser verification, stable accessible field names, CI checks and setup/verification notes.

## Verification

- 80 behavior tests pass; project-wide statement coverage is above 96%, with no source files excluded.
- Typecheck, ESLint, Prettier and the production build pass.
- Browser checks cover live public data, validation, Auth URL updates and guest action guards. Live Firebase sign-in remains unverified because of the console error above.
- All task branches are merged locally into `story-4`. The cross-check branch is not merged into `story-3`.
