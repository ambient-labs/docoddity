import { expect } from 'vitest';

expect.extend({
  async toEqualSet(_actual: string[] | Promise<string[]>, _expected: string[] | Promise<string[]>) {
    const { isNot } = this;

    const [actual, expected] = await Promise.all([_actual, _expected]);

    if (isNot) {
      expect(new Set(actual)).not.toEqual(new Set(expected));
    } else {
      expect(new Set(actual)).toEqual(new Set(expected));
    }
    return {
      message: () => `Good`,
      pass: true,
    };
  }
});

