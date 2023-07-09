import path from 'path';
import { writeFile } from '../../packages/docoddity/src/bin/lib/utils/write-file.js';
import {
  mkdirp,
  readFile,
} from 'fs-extra';

import { DOCODDITY_PACKAGE } from './config.js';
import { symlinkIfNotExists } from './symlinkIfNotExists.js';
import { ifNotExists } from './ifNotExists.js';

export const pnpmInstall = async (cwd: string) => {
  // console.log('pnpmInstall', cwd);
  const NODE_MODULES = path.resolve(cwd, 'node_modules');
  const DOCODDITY_NODE_MODULES_FOLDER = path.resolve(NODE_MODULES, 'docoddity');
  const BIN_PATH = path.resolve(NODE_MODULES, '.bin/docoddity');
  const [binContents] = await Promise.all([
    readFile(path.resolve(__dirname, './docoddity-bin.sh'), 'utf-8'),
    mkdirp(NODE_MODULES),
  ]);
  await Promise.all([
    symlinkIfNotExists(DOCODDITY_PACKAGE, DOCODDITY_NODE_MODULES_FOLDER),
    ifNotExists(BIN_PATH, () => writeFile(BIN_PATH, binContents)),
  ]);
  // await runPNPMCommand('install ', cwd);
};
