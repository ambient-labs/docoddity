import { defineConfig, mergeConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    maxConcurrency: 15,
    sequence: {
      concurrent: process.env.CI === 'true',
    },
    testTimeout: 120000,
    hookTimeout: 1000,
    retry: 3,
    include: [
      'test/tests/**/*.test.ts',
    ],
    exclude: [
      'packages/**/*.test.*',
    ],
    // watchExclude: [
    //   '**/*.json',
    //   'tmp/**/*',
    // ],
    globals: true,
    typecheck: {
      // tsconfig: './tsconfig.vitest.json'
    },
    setupFiles: [
      path.resolve(__dirname, './test/setup/index.ts'),
    ]
  },
});
