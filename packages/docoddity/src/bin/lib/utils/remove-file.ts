import path from 'path';
import {
  exists,
} from './fs.js';
import { Folders } from '../types.js';

import { unlink as fsUnlink } from 'fs/promises';
import { withExt } from './with-ext.js';

export const removeFile = async ({ targetDir }: Folders, file: string) => {
  const targetHTMLFilepath = withExt(file, 'html');
  const fullPath = path.resolve(targetDir, targetHTMLFilepath);
  if (!(await exists(fullPath))) {
    throw new Error(`File ${fullPath} does not exist`);
  }
  await fsUnlink(fullPath);
};
