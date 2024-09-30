import path from 'path';
import type {
  DocoddityTestFile,
} from './types.js';
import { getCwd } from './getCwd.js';
import { Runner } from './runner.js';
import { getDist } from './getDist.js';
import { pnpmInstall } from './pnpmInstall.js';
import { getUpdateFiles, } from './get-update-files.js';
import { getRemoveFiles } from './get-remove-files.js';
import { rimraf } from 'rimraf';
import { rename, writeFile, } from 'fs/promises';
import { getPrintURL } from './get-print-url.js';
import { getWaitForDocoddityFileToBeWritten } from './get-wait-for-docoddity-file-to-be-written.js';

export const setupSite = async (files: DocoddityTestFile[]) => {
  const buildDirFolderName = '.build';

  const cwd = getCwd();
  const waitForDocoddityFileToBeWritten = getWaitForDocoddityFileToBeWritten(cwd);
  const updateFiles = getUpdateFiles(cwd, waitForDocoddityFileToBeWritten);
  const removeFiles = getRemoveFiles(cwd);
  const buildDir = path.resolve(cwd, buildDirFolderName);
  const dist = getDist(buildDir);
  const runner = new Runner(dist, files);

  await rimraf(cwd);
  await Promise.all([
    runner.setup(),
    updateFiles(files, false),
  ]);
  await pnpmInstall(cwd);
  return {
    buildDir,
    cwd,
    dist,
    runner,
    waitForDocoddityFileToBeWritten,
    printURL: getPrintURL(files, runner),
    updateFiles,
    removeFiles,
    renameFiles: async (files): Promise<void> => {
      await Promise.all(files.map(async ({ source, target, content }) => {
        await rename(path.resolve(cwd, source), path.resolve(cwd, target));
        if (content) {
          await writeFile(path.resolve(cwd, target), content, 'utf-8');
        }
      }));
    },
  };
};
