import { type Page, } from 'playwright';
import { type Expectations } from './test/setup/matchers/toMatchPage.ts';

interface CustomMatchers<R = unknown> {
  toContainTags(message: string, type: string): R;
  toEqualSet(message: string, type: string): R;
  toMatchPage(page: Page, expectations: Expectations): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> { }
  interface AsymmetricMatchersContaining extends CustomMatchers { }
}
