import path from 'path';
import { writeFile } from '../../packages/docoddity/src/bin/lib/utils/write-file.js';
import { getHashedName } from '../../packages/docoddity/src/bin/lib/get-hashed-name.js';

import { DocoddityFile } from "./types.js";
import { ROOT } from './config.js';

export const getCwd = async (files: DocoddityFile[]) => {
  const testName = getHashedName(JSON.stringify(files));
  // const testName = expect.getState().currentTestName?.split('>').map((s) => s.trim().split(' ').join('-').toLowerCase());
  // if (!testName) {
  //   throw new Error('No test name found');
  // }
  const cwd = path.resolve(ROOT, 'test/.sites/', testName);
  await writeFile(path.resolve(cwd, 'files.json'), JSON.stringify(files, null, 2));
  return cwd;
}
