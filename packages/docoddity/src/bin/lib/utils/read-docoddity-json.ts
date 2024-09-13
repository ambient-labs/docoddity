import path from 'path';
import {
  type DocoddityContents
} from '../types.js';
import {
  readFile,
} from './fs.js';

export const readDocoddityJSON = async (inputDir: string): Promise<DocoddityContents> => {
  const docoddityPath = path.resolve(inputDir, 'docoddity.json');
  try {
    const contents = await readFile(docoddityPath);
    return JSON.parse(contents);
  } catch (err) {
    throw new Error(`Error reading docoddity.json at ${docoddityPath}: ${err}`);
  }
};

