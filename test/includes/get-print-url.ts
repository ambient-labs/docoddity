import { exec } from 'child_process';
import { getDist } from './getDist.js';
import {
  type DocoddityTestFile
} from './types.js';
import {
  type Runner
} from './runner.js';

export const getPrintURL = (files: DocoddityTestFile[], runner: Runner) => async (d = 1000, _url?: string) => {
  const url = _url ? `${runner.url}${_url}` : runner.page.url();

  console.log(url);
  exec(`open -a "Google Chrome" ${url}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening Chrome: ${error}`);
      return;
    }
  });
  await new Promise((resolve) => setTimeout(resolve, d));
  return url;
}
