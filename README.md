# minigames

A collection of small, lightweight games.

## Getting started

Clone the repository and add each game in its own feature directory. The project currently has no external dependencies.

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
