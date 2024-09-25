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

  const cwd = getCwd();
  const updateFiles = getUpdateFiles(cwd)
  const removeFiles = getRemoveFiles(cwd)
  const buildDir = path.resolve(cwd, buildDirFolderName);
  const dist = getDist(buildDir);
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
    updateFiles,
    removeFiles: async files => {
      await removeFiles(files);
      await runner.waitForUrl();
    },
  };
};
