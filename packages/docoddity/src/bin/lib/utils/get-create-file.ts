import path from 'path';
import pkg from 'fs-extra';
import { writeFile, } from './write-file.js';
import type { TransformFn, } from '../types.js';
const {
  readFile,
} = pkg;

export const getCreateFile = (origInput: string) => async (
  filepath: string,
  targetPath: string,
  transform: TransformFn = c => c,
  log = (...msg: string[]) => { },
): Promise<void> => {
  const origInputPath = path.resolve(origInput, filepath);
  const contents = await readFile(origInputPath, 'utf8',);
  const transformedContent = await transform(contents, origInputPath);
  await writeFile(targetPath, transformedContent.trim());
};
