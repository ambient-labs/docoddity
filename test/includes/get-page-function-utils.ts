import type {
  Runner
} from "./runner.js";
import type {
  DocoddityDevProcess,
  WaitFor,
  WaitForSelector,
  WaitUntilMessage
} from "./types.js";

const DEFAULT_TIMEOUT = Infinity;
const DEFAULT_INTERVAL = 50;

export const getPageFunctionUtils = (runner: Runner, docoddityDevProcess: DocoddityDevProcess) => {
  const getQuery = (selector: string) => runner.page.evaluate((selector) => {
    const el = window.document.querySelector(selector);
    if (!!el && el instanceof HTMLElement) {
      return el.innerText;
    }
    throw new Error('No element found');
  }, selector);

  const waitUntilMessage: WaitUntilMessage = (msg, timeout = 5000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(`Timed out after ${timeout}ms waiting for message: "${msg}"`);
    }, timeout);
    docoddityDevProcess.stdout.on('data', (data: Uint8Array) => {
      const stringData = data.toString();
      // console.log('**', stringData);
      if (stringData.includes(msg)) {
        clearTimeout(timer);
        resolve()
      }
    });
  });


  const waitFor: WaitFor = async (fn, timeout = DEFAULT_TIMEOUT, interval = DEFAULT_INTERVAL) => {
    const start = performance.now();
    const test = async () => {
      await runner.page.reload();
      await fn();
    };
    while (true) {
      if (performance.now() - start > timeout) {
        throw new Error(`Timed out after ${timeout}ms waiting to execute function`);
      }
      try {
        await test();
        break;
      } catch (err) { }
      await sleep(interval);
    }
  };

  const waitForSelector: WaitForSelector = async (selector, timeout = DEFAULT_TIMEOUT, interval) => {
    try {
      await waitFor(async () => {
        await runner.page.waitForSelector(selector, { timeout: DEFAULT_INTERVAL - 20 });
      }, timeout, interval);
    } catch (err) {
      throw new Error(`Timed out after ${timeout}ms waiting for selector: "${selector}"`);
    }
  }

  const waitForComputedStyle = async (style: string, expectation: string, ...args) => {
    try {
      await waitFor(async () => {
        const result = await runner.page.evaluate((style) => window.getComputedStyle(window.document.body)[style], style);
        expect(result).toEqual(expectation);
      }, ...args);
    } catch (err) {
      throw new Error(`Timed out after ${DEFAULT_TIMEOUT}ms waiting for style: "${style}" to match "${expectation}"`);
    }
  }

  const waitForScript = async (name: string, expectation: string, ...args) => {
    let result;
    try {
      await waitFor(async () => {
        result = await runner.page.evaluate((name) => window[name](), name);
        expect(result).toEqual(expectation);
      }, ...args);
    } catch (err) {
      throw new Error(`Timed out after ${DEFAULT_TIMEOUT}ms waiting for script: "${name}" return to match "${expectation}". Most recent invocation: ${result}`);
    }
  };


  return {
    getQuery,
    waitUntilMessage,
    waitForSelector,
    waitFor,
    waitForComputedStyle,
    waitForScript,
  }
}

const sleep = (duration: number) => new Promise((r) => setTimeout(r, duration));
