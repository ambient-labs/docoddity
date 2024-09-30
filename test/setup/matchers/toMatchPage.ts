import type { Runner } from '../../includes/runner.js';

export interface Expectations {
  pageTitle: string;
  bodyText?: string;
  leftNav?: (string | Record<string, unknown>)[];
  prevHTML?: string;
  nextHTML?: string;
  bodyH1?: string;
}

expect.extend({
  async toMatchPage(runner: Runner, {
    pageTitle,
    bodyText,
    leftNav,
    prevHTML,
    nextHTML,
    bodyH1,
  }: Expectations) {
    if (!runner.page) {
      throw new Error('No page found on runner. Did you pass `runner.page`? If so, please pass `runner`.');
    }
    const { isNot } = this;

    if (isNot) {
      throw new Error('isNot not yet implemented for `toMatchPage`');
    }

    const results = await runner.page.evaluate((leftNav) => {
      const prev = window.document.querySelector('a[aria-role="prev"] span');
      const next = window.document.querySelector('a[aria-role="next"] span');
      return [
        window.document.title,
        window.document.querySelector('article#page-article p')?.innerHTML,
        Array.from(window.document.querySelectorAll('nav#left-nav a')).map(el => el.outerHTML.trim()),
        prev ? prev.innerHTML : undefined,
        next ? next.innerHTML : undefined,
        window.document.querySelector('article#page-article h1')?.innerHTML,
      ];
    });
    if (pageTitle) {
      expect(results[0]).toEqual(pageTitle);
    }
    if (bodyText) {
      expect(results[1]).toEqual(bodyText);
    }
    if (leftNav) {
      if (leftNav.every((el) => typeof el === 'string')) {
        expect(results[2]).toEqual(leftNav);
      } else {
        for (let i = 0; i < leftNav.length; i++) {
          const outerHTML = results[2][i];
          const expectation = leftNav[i];

          const actualValues = await runner.page.evaluate(({ attrs, outerHTML }) => {
            const tempEl = document.createElement('div');
            tempEl.innerHTML = outerHTML;
            const anchorEl = tempEl.firstChild as HTMLAnchorElement;
            const result = attrs.reduce((obj, attr) => ({
              ...obj,
              [attr]: anchorEl.getAttribute(attr),
            }), {});

            result.text = anchorEl.innerHTML;
            return result;
          }, { attrs: Object.keys(expectation), outerHTML });
          try {
            expect(actualValues).toEqual(expectation);
          } catch (err) {
            return {
              message: () => {
                const diffMessage = this.utils.diff(expectation, actualValues, {
                  expand: this.expand,
                });
                return `Expected left nav anchor tags to match, but they didn't:\n\n${diffMessage}`;
              },
              pass: false,
            };
          }
        }
      }
    }
    if (prevHTML) {
      expect(results[3]).toEqual(prevHTML);
    }
    if (nextHTML) {
      expect(results[4]).toEqual(nextHTML);
    }
    if (bodyH1) {
      expect(results[5]).toEqual(bodyH1);
    }

    return {
      message: () => `Good`,
      pass: true,
    };
  }
});

