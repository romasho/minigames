# Story 4 work breakdown

Base: `story-4`, created from `story-3`. Each task branch is merged with a merge commit so its scope remains visible in history.

1. `codex/story-4-auth`: validation, Firebase adapter, Email/Password registration and login, Google popup, pending locks and error recovery (4-1-1 through 4-1-4). Includes the shared session core required by authentication.
2. `codex/story-4-session`: profile and avatars, five-minute session recovery/expiry, logout, URL guards and dialog restoration (4-3-1 through 4-3-4).
3. `codex/story-4-interactions`: personalized reads, favorites, comment creation, stable avatar colors and comment likes (4-2-1 through 4-2-4).
4. `codex/story-4-tests`: Vitest tooling, behavior tests, project-wide coverage and final verification (4-4-1 through 4-4-4).

The final cross-check comparison is `story-4` → `story-3`; leave that PR unmerged.

## External setup

Firebase Console currently requires account MFA before project creation. Live Firebase authentication must be verified after project configuration; automated tests mock the Firebase SDK and HTTP boundaries.
