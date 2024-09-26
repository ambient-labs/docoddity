import path from 'path';
import pkg from 'fs-extra';

export const {
  exists,
} = pkg;

import { unlink as fsUnlink } from 'fs/promises';

export const getRemoveFiles = (cwd: string) => async (
  files: string[] | string,
): Promise<void> => {
  await Promise.all([].concat(files).map(file => path.resolve(cwd, file)).map(async file => {
    if (!(await exists(file))) {
      throw new Error(`File ${file} does not exist`);
    }
    // console.log('[TEST] Removing file:', file);
    await fsUnlink(file);
  }));
};
