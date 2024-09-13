import { exec } from 'child_process';
import { getDist } from './getDist.js';
import {
  type DocoddityTestFile
} from './types.js';
import {
  type Runner
} from './runner.js';

export const getPrintURL = (files: DocoddityTestFile[], runner: Runner) => async (d = 10000, url = '/') => {
  // const name = await getDist(files, buildDirFolderName);
  // const runner = runners.get(name);
  // if (!runner) {
  //   throw new Error('No runner');
  // }
  console.log(runner.url);
  exec(`open -a "Google Chrome" ${runner.url}${url}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error opening Chrome: ${error}`);
      return;
    }
  });
  await new Promise((resolve) => setTimeout(resolve, d));
  return runner.url;
}
