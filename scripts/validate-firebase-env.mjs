import { appendFileSync } from 'node:fs';
import { loadEnv } from 'vite';

const names = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

// Empty Actions variables must not hide the checked-in production defaults.
for (const name of names) {
  if (!process.env[name]?.trim()) delete process.env[name];
}
const config = loadEnv('production', process.cwd(), 'VITE_FIREBASE_');
const invalid = names.filter(
  (name) => !/^[A-Za-z0-9:._-]+$/.test(config[name] ?? ''),
);
if (invalid.length) {
  for (const name of invalid) {
    console.error(
      `::error::Configure ${name} in .env.production or repository Actions variables/secrets.`,
    );
  }
  process.exit(1);
}

// Later workflow steps receive the same resolved values that were validated.
if (process.env.GITHUB_ENV) {
  appendFileSync(
    process.env.GITHUB_ENV,
    names.map((name) => `${name}=${config[name]}\n`).join(''),
  );
}
console.log('Firebase Web configuration is complete.');
