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

## Quality checks

```bash
npm run typecheck
npm run lint
npm run format:check
npm run validate
```

ESLint uses strict, type-aware TypeScript rules and the Unicorn recommended
configuration. Prettier controls formatting. Husky validates commit messages
against the RS School Conventional Commits format and prevents pushes when lint
or formatting checks fail.

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
