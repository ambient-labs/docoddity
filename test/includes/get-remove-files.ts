import path from 'path';
import {
  type DocoddityTestFile
} from "./types.js";
import pkg from 'fs-extra';

export const {
  exists,
  unlink,
} = pkg;

export const getRemoveFiles = (cwd: string) => async (
  files: string[] | string,
): Promise<void> => {
  await Promise.all([].concat(files).map(file => path.resolve(cwd, file)).map(async file => {
    if (!(await exists(file))) {
      throw new Error(`File ${file} does not exist`);
    }
    try {
      return unlink(file);
    } catch (err) {
      console.error(`Error removing file ${file}:`, err);
      throw err;
    }
  }));
};
