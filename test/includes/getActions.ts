import type { Runner } from "./runner.js";

export const getClick = (runner: Runner) => (selector: string) => runner.page.evaluate((selector) => {
  const el = window.document.querySelector(selector);
  if (!el || !(el instanceof HTMLElement)) {
    throw new Error(`No HTML element for ${selector} found`);
  }
  el.click();
}, selector);

export const getActions = (runner: Runner, selectors: { next: string; prev: string; }) => {
  const _click = getClick(runner);
  const click = async (selector: string) => {
    await _click(selector);
    await runner.waitForUrl();
  };
  return {
    clickNext: () => click(selectors.next),
    clickPrev: () => click(selectors.prev),
  }
}

