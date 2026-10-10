import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'qa/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // All source TypeScript, including bootstrap URL recovery, is in scope.
      exclude: [],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { statements: 80 },
    },
  },
});
