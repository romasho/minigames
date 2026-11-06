# minigames

A collection of small, lightweight games.

## Getting started

Requirements: Node.js 22.13+ (22.x) or 24+. GitHub Actions uses Node.js 24; use it locally for consistency.

```bash
npm install
npm run dev
```

Vite serves the development build with hot module replacement. Use
`npm run build` for a type-checked, optimized production bundle in `dist` and
`npm run preview` to inspect that bundle locally.

## Install and browse offline (Story 5)

Run `npm run build` and `npm run preview`, then open
`http://localhost:4173/minigames/`. The Service Worker runs in the production
build on localhost or HTTPS. After the first online visit finishes preparing
the cache, the home page, library, and short game cards are available offline.
The library uses the bundled snapshot of 24 games and still supports category
filters, sorting, and six games per page. Account actions, comments, favorites,
and current player records need a connection. When the browser comes back
online, the open page fetches live data again.

1. Open the home page in a clean browser profile. In Chrome or Edge, check
   **Application → Service workers** and wait for the worker to activate and
   control the page. Leave **Bypass for network** unchecked.
2. Use **Install MiniGames** when the browser offers it. On iPhone, open the
   HTTPS site in Safari and tap **Share → Add to Home Screen**. Open the app
   from its icon once while still online so it can prepare its offline cache.
3. Close the tab, disconnect the device, and launch MiniGames from its icon.
   Check the offline notice and open the library for the first time. Select
   **Puzzle**, change the sort order, go to page 2, and open a game. Its cover
   and short description should appear along with a note about online actions.
   With the browser offline, also open `/minigames/library` directly in a new
   tab. If using DevTools to emulate offline mode, enable it in that tab before
   entering the URL.
4. Reconnect while the library is open. The offline notice should disappear and
   the library should request live data from the API.
5. To verify an update, serve a changed production build at the same URL and
   use **Update** under **Application → Service workers**. Close all MiniGames
   tabs and installed windows, then reopen the app. The new worker should be
   active and **Cache Storage** should show one current `minigames-shell` cache
   for that scope.

Run `npm run validate`, `npm run test:coverage`, and `npm run build` before the
demo.

## Firebase Authentication (Story 4)

Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/), register a Web app, and copy `.env.example` to `.env.local`. Fill in the four `VITE_FIREBASE_*` values from the Web app configuration. These identify the public Firebase Web app; never use service-account keys here.

In Authentication → Sign-in method, enable Email/Password and Google (choose a support email). Add `localhost`, `127.0.0.1` (when using that development URL) and your deployed hostname under Authentication → Settings → Authorized domains. Restart Vite after changing environment variables. Production builds need the same variables at build time.

GitHub Pages builds use the public MiniGames Web app identifiers committed in `.env.production`. These Firebase client parameters are included in the browser bundle; never place service-account keys or other private credentials in this file. You can override any parameter with repository Actions variables (or secrets) under Settings → Secrets and variables → Actions: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_APP_ID`. Repository variables take precedence over secrets of the same name. Empty Actions values fall back to `.env.production`. The deployment workflow validates the resolved configuration and passes it to Vite; local `.env.local` files are not uploaded to the runner.

The SDK establishes identity; the UI uses a separate five-minute app session stored as `minigames:sholomickiyr:app-session`. It contains only `displayName`, `email`, `authenticatedAt` and optional `avatarUrl`. The stored profile is accepted only after Firebase finishes restoring the same account; the displayed name/avatar come from Firebase, and protected mutations validate the SDK identity before sending a request. Reloads do not extend the session lifetime. Expiration and logout remove this key and sign out of Firebase. See [the Story 4 breakdown](docs/story-4.md) for branches and task scope.

If account creation succeeds but saving its display name fails, registration rolls back only that newly created account so the user can retry. If Firebase rejects the rollback too, the error explains that the account already exists and offers login as the recovery path.

## Quality checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm run validate
npm test
npm run test:coverage
```

ESLint uses strict, type-aware TypeScript rules and the Unicorn recommended
configuration. Prettier controls formatting. Husky validates commit messages
against the RS School Conventional Commits format and prevents pushes when lint
or formatting checks fail.

Tests use Vitest, jsdom, mocked Firebase and HTTP responses. Coverage includes every source TypeScript file, with no source exclusions; `npm run test:coverage` enforces 80% aggregate statement coverage and writes an HTML report to `coverage/index.html`.

## Design system

Shared Sass resources live in `src/styles/abstracts`. The token values are based
on the MiniGames Figma guidebook and include colors, spacing, responsive
breakpoints, radii, button dimensions, typography, and shadows. Import the
public Sass API instead of using raw design values:

```scss
@use 'path/to/styles/abstracts' as ds;

.example {
  padding: ds.$size-2;
  color: ds.$color-on-primary;

  @include ds.respond-at-most('tablet') {
    padding: ds.$size-1;
  }
}
```

## Project structure

```text
src/
├── app/          # Application bootstrap and routing
├── pages/        # Route-level screens
├── components/   # Reusable UI components
├── features/     # Self-contained game and product features
├── services/     # API, persistence, and external integrations
├── state/        # Shared application state
├── utils/        # Framework-independent helpers
├── styles/       # Global styles, design tokens, and mixins
└── assets/       # Images, icons, fonts, and other static files
```

Keep page-specific code inside its page directory. A feature should own its UI,
logic, styles, and tests whenever practical. Move code into `components` or
`utils` only after it becomes genuinely reusable.

## Contributing

Keep each game self-contained under `src/features` and document any game-specific
setup in its directory.
