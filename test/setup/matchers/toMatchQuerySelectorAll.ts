import type { Page } from 'playwright';
// import { Buffer } from "node:buffer";
import { minify as _minify } from "html-minifier";

const minify = (html: string = '') => {
  try {
    return _minify(html, {
      collapseWhitespace: true,
    });
  } catch (err) {
    console.error(html)
    throw new Error(`Error minifying: ${html}: ${err}`);
  }
};


expect.extend({
  async toMatchQuerySelectorAll(page: Page, selector: string, _expected: string[], mobile = false) {
    const { isNot } = this;

    if (isNot) {
      throw new Error('isNot not yet implemented for toMatchQuerySelectorAll');
    }

    const navLinks = (await page.evaluate((selector) => Array.from(window.document.querySelectorAll(selector)).map(a => a.outerHTML), selector)).map(minify);
    const expected = _expected.map(minify);
    try {
      expect(navLinks).toEqual(expected);
    } catch (err) {
      return {
        message: () => {
          const diffMessage = this.utils.diff(expected, navLinks, {
            expand: this.expand,
          });
          return `Expected header navigation links to match, but they didn't:\n\n${diffMessage}`;
        },
        pass: false,
      };
    }
    return {
      message: () => `Good`,
      pass: true,
    };
  }
});
