import { readFile } from "./utils/fs.js";
import { createHash } from 'node:crypto';

const hashContents = async (filepath: string) => {
  const contents = await readFile(filepath);
  return createHash('sha256').update(contents).digest('hex');
}

export const loadUserScript = async (filepath: string) => {
  if (filepath.endsWith('.ts')) {
    throw new Error(`Only JavaScript user scripts are supported, ${filepath} is a TypeScript file. Please compile it first.`)
  }

  const enhancerModule = await import(`${filepath}?hash=${await hashContents(filepath)}`);
  const loadedFunction = enhancerModule.default || enhancerModule;

  if (typeof loadedFunction !== 'function') {
    throw new Error('Markdown enhancer must be a function');
  }

  return loadedFunction;
}
