interface CustomMatchers<R = unknown> {
  toContainTags(message: string, type: string): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> { }
  interface AsymmetricMatchersContaining extends CustomMatchers { }
}
