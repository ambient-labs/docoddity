import { type Expectations } from './test/setup/matchers/toMatchPage.ts';
import type { Page } from 'playwright';

interface CustomMatchers<R = unknown> {
  toContainTags(message: string, type: string): R;
  toEqualSet(message: string, type: string): R;
  toMatchPage(page: Page, expectations: Expectations): R;
  toMatchQuerySelectorAll: (page: Page, expected: string[], mobile?: boolean) => R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> { }
  interface AsymmetricMatchersContaining extends CustomMatchers { }
}
