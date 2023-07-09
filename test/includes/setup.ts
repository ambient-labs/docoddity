import path from 'path';
import {
  runPNPMCommand,
} from '@ambient-labs/the_floor_is_lava'
import { chromium, } from 'playwright';
import { writeFile } from '../../packages/docoddity/src/bin/lib/utils/write-file.js';

import { exec } from 'child_process';
import { DocoddityFile } from './types.js';
import { getCwd } from './getCwd.js';
import { Runner } from './runner.js';
import { getDist } from './getDist.js';
import { getFiles } from './getFiles.js';
import { pnpmInstall } from './pnpmInstall.js';

const runners = new Map<string, Runner>();
type STD = Parameters<typeof runPNPMCommand>[2];
export const setup = (stdOne: STD = {}) => {
  const configureDocodditySite = async (files: DocoddityFile[], stdTwo: STD = {}) => {
    const printURL = async (d = 10000, url = '/') => {
      const name = await getDist(files);
      const runner = runners.get(name);
      if (!runner) {
        throw new Error('No runner');
      }
      console.log(runner.server.url);
      exec(`open -a "Google Chrome" ${runner.server.url}${url}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error opening Chrome: ${error}`);
          return;
        }
      });
      await new Promise((resolve) => setTimeout(resolve, d));
      return runner.server.url;
    }

    try {
      const cwd = await getCwd(files);
      const buildDir = path.resolve(cwd, '.build');
      const dist = await getDist(files);
      // console.log('dist', dist);
      const runner = new Runner(dist, files);

      // console.log(files);
      // console.log('current test name', expect.getState().currentTestName)
      runners.set(dist, runner)
      await Promise.all([
        runner.setup(),
        ...getFiles(files).map(({
          filepath,
          content,
        }) => {
          return {
            filepath: path.resolve(cwd, filepath),
            content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
          }
        }).map(async ({
          filepath,
          content,
        }) => await writeFile(filepath, content)),
      ]);
      await pnpmInstall(cwd);
      await runPNPMCommand(`docoddity build --output ${buildDir}`, cwd, {
        stdout: console.log,
        stderr: console.error,
        ...stdOne,
        ...stdTwo,
      });
      await runner.startServer();
      return { runner, printURL };
    } catch (err) {
      console.error('Error setting up test:', err);
      throw err;
    }
  };

  afterAll(async () => {
    await Promise.all([
      Array.from(runners).map(async ([name, runner]) => {
        try {
          await runner._close();
          runners.delete(name);
        } catch (err) {
          console.log('error closing runner for files:', runner.files)
        }
      }),
    ])
  }, 100);

  return configureDocodditySite;
};
