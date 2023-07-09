import type { Runner } from "./runner.js";

export const getActions = (runner: Runner, selectors: { next: string; prev: string; }) => {
  const click = async (selector: string) => {
    await runner.page.evaluate((selector) => {
      const button = window.document.querySelector(selector);
      if (!button || !(button instanceof HTMLElement)) {
        throw new Error('No next button found');
      }
      button.click();
    }, selector);
    await runner.waitForUrl();
  };
  return {
    clickNext: () => click(selectors.next),
    clickPrev: () => click(selectors.prev),
  }
}

