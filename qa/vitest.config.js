import { defineConfig } from 'vitest/config';

// The audit regressions are also included in the regular npm test suite.
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['qa/*.test.ts'],
  },
});
