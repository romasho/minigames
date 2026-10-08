# minigames

A collection of small, lightweight games.

## Getting started

Requirements: Node.js 20.19 or newer.

```bash
npm install
npm run dev
```

Vite serves the development build with hot module replacement. Use
`npm run build` for a type-checked, optimized production bundle in `dist` and
`npm run preview` to inspect that bundle locally.

## Firebase Authentication (Story 4)

Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/), register a Web app, and copy `.env.example` to `.env.local`. Fill in the four `VITE_FIREBASE_*` values from the Web app configuration. These identify the public Firebase Web app; never use service-account keys here.

In Authentication → Sign-in method, enable Email/Password and Google (choose a support email). Add `localhost` and your deployed hostname under Authentication → Settings → Authorized domains. Restart Vite after changing environment variables. Production builds need the same variables at build time.

The SDK establishes identity; the UI uses a separate five-minute app session stored as `minigames:sholomickiyr:app-session`. It contains only `displayName`, `email`, `authenticatedAt` and optional `avatarUrl`. Reloads do not extend its lifetime. Expiration and logout remove this key and sign out of Firebase. See [the Story 4 breakdown](docs/story-4.md) for branches and task scope.

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
