import { defineConfig, mergeConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    sequence: {
      concurrent: false,
    },
    testTimeout: 500,
    hookTimeout: 100,
    include: [
      '**/*.test.*',
    ],
    exclude: [
      '**/*.test.json',
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
      path.resolve(__dirname, '../../test/setup/index.ts'),
    ]
  },
});

