import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts', // Pure entry point: imports styles and invokes startApp, with no decisions.
      ],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { statements: 80 },
    },
  },
});
