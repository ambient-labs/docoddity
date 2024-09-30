const DEFAULT_TIMEOUT = Infinity;
const DEFAULT_INTERVAL = 50;

export const waitFor = async (fn: () => Promise<void>, timeout = DEFAULT_TIMEOUT, interval = DEFAULT_INTERVAL) => {
  const start = performance.now();
  const test = async () => {
    await fn();
  };
  while (true) {
    if (performance.now() - start > timeout) {
      throw new Error(`Timed out after ${timeout}ms waiting to execute function: ${fn}`);
    }
    try {
      await test();
      break;
    } catch (err) { }
    await sleep(interval);
  }
};

const sleep = (duration: number) => new Promise((r) => setTimeout(r, duration));
