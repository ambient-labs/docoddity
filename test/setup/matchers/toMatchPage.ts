import { type Page, } from 'playwright';

export interface Expectations {
  pageTitle: string;
  bodyText?: string;
  leftNav?: string[];
  prevHTML?: string;
  nextHTML?: string;
  bodyH1?: string;
}

expect.extend({
  async toMatchPage(page: Page, {
    pageTitle,
    bodyText,
    leftNav,
    prevHTML,
    nextHTML,
    bodyH1,
  }: Expectations) {
    const { isNot } = this;

    if (isNot) {
      throw new Error('isNot not yet implemented for `toMatchPage`');
    }

    const results = await page.evaluate(() => {
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
      expect(results[2]).toEqual(leftNav);
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

