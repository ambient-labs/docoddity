import path from 'path';
import {
  unlink,
} from './fs.js';
import { Folders } from '../types.js';

export const removeFile = ({ targetDir }: Folders, file: string) => unlink(path.resolve(targetDir, file));
