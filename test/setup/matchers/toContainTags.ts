import { Page } from 'playwright';
import { expect } from 'vitest';
type TagDefinitionWithContents = { url: string; contents: string; };
export type TagDefinition = string | TagDefinitionWithContents;

expect.extend({
  async toContainTags(page: Page, tags: TagDefinition[], {
    trim = true,
  }: { trim?: boolean; } = {}) {
    const { isNot } = this;

    if (isNot) {
      throw new Error('isNot not yet implemented for `toContainTags`');
    }

    const results: (boolean | { contents?: string; exists: boolean; })[] = await page.evaluate((urls) => {
      return urls.map(url => {
        if (typeof url === 'string') {
          return !!window.document.querySelector(url);
        } else {
          const exists = !!window.document.querySelector(url.url);
          return {
            exists,
            contents: exists ? window.document.querySelector(url.url)?.innerHTML : undefined,
          }
        }
      })
    }, tags);

    const actual: Record<string, unknown> = {};
    const expected: Record<string, unknown> = {};
    // const errors: string[] = [];
    const getTagAndResult = (i: number): { result: boolean; tag: string; } | { result: { contents?: string; exists: boolean; }; tag: TagDefinitionWithContents } => {
      const tag = tags[i];
      const result = results[i];
      if (typeof tag === 'string' && typeof result === 'boolean') {
        return {
          tag,
          result,
        }
      }
      return {
        tag: tag as TagDefinitionWithContents,
        result: result as { contents?: string; exists: boolean; },
      }
    }
    for (let i = 0; i < tags.length; i++) {
      const { tag: tag, result, } = getTagAndResult(i);
      if (typeof result === 'boolean') {
        actual[tag] = result;
        expected[tag] = true;
      } else {
        const { url, contents: urlContents } = tag;
        actual[url] = {
          ...result,
          contents: trim && result.contents ? result.contents.trim() : result.contents,
        };
        expected[url] = {
          exists: true,
          contents: trim ? urlContents.trim() : urlContents,
        };
      }
    }
    expect(actual).toEqual(expected);
    return {
      message: () => `Good`,
      pass: true,
    };
  }
});
