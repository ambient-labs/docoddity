import path from 'path';
import pkg from 'fs-extra';
import * as url from 'url';
const {
  readFile,
} = pkg;
import type {
  docoddityDataFile,
  FileDefinition,
} from "./types.js";

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

export const getdocoddity = async ({ input }: FileDefinition): Promise<Omit<docoddityDataFile, 'theme'> & {
  theme: string;
}> => {
  let docoddity = {};
  try {
    docoddity = JSON.parse(await readFile(input, 'utf-8'));
  } catch (err) { }

  return {
    scripts: [],
    styles: [],
    theme: 'default',
    ...docoddity,
  }
}
