import path from 'path';
import type {
  DocoddityTestFile,
} from './types.js';
import { getCwd } from './getCwd.js';
import { Runner } from './runner.js';
import { getDist } from './getDist.js';
import { pnpmInstall } from './pnpmInstall.js';
import { getUpdateFiles } from './get-update-files.js';
import { getRemoveFiles } from './get-remove-files.js';
import { rimraf } from 'rimraf';

export const setupSite = async (files: DocoddityTestFile[], key: string = '') => {
  const buildDirFolderName = '.build';

  try {
    const cwd = await getCwd(files, key);
    const updateFiles = getUpdateFiles(cwd)
    const removeFiles = getRemoveFiles(cwd)
    const buildDir = path.resolve(cwd, buildDirFolderName);
    const dist = await getDist(files, buildDir);
    const runner = new Runner(dist, files);

    await rimraf(cwd);

    await Promise.all([
      runner.setup(),
      updateFiles(files),
    ]);
    await pnpmInstall(cwd);
    return {
      buildDir,
      cwd,
      dist,
      runner,
      updateFiles: async files => {
        await updateFiles(files);
        // await runner.waitForUrl();
      },
      removeFiles: async files => {
        await removeFiles(files);
        await runner.waitForUrl();
      },
      // buildDirFolderName,
    };
  } catch (err) {
    console.error('Error setting up test:', err);
    throw err;
  }
};
