import path from 'path';
import {
  isDocoddityContents,
  isDocoddityFileDefinition,
  type DocoddityContents
} from '../types.js';
import {
  readFile,
  exists,
} from './fs.js';

const readAndParseJSON = async (docoddityPath: string) => {
  try {
    const contents = await readFile(docoddityPath);
    return JSON.parse(contents);
  } catch (err) {
    throw new Error(`Error parsing docoddity.json at ${docoddityPath}: ${err}`);
  }
};

export const readDocoddityJSON = async (inputDir: string): Promise<DocoddityContents | undefined> => {
  const docoddityPath = path.resolve(inputDir, 'docoddity.json');
  if (!await exists(docoddityPath)) {
    return undefined;
  }
  const parsedContents = await readAndParseJSON(docoddityPath);
  if (!isDocoddityContents(parsedContents)) {
    if (typeof parsedContents !== 'object') {
      throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected object, got ${typeof parsedContents}`);
    }
    if (!!parsedContents.title && typeof parsedContents.title !== 'string') {
      throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected title to be string, got ${typeof parsedContents.title}`);
    }
    if (!!parsedContents.theme && typeof parsedContents.theme !== 'string') {
      throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected theme to be string, got ${typeof parsedContents.theme}`);
    }
    if (!!parsedContents.head) {
      if (!Array.isArray(parsedContents.head)) {
        throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected head to be array, got ${typeof parsedContents.head}`);
      }
      for (const tag of parsedContents.head) {
        if (typeof tag !== 'string' && !isDocoddityFileDefinition(tag)) {
          throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected head to be array of strings or objects, got ${JSON.stringify(tag)}`);
        }
      }
    }
    if (!!parsedContents.body) {
      if (!Array.isArray(parsedContents.body)) {
        throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected body to be array, got ${typeof parsedContents.body}`);
      }
      for (const tag of parsedContents.body) {
        if (typeof tag !== 'string' && !isDocoddityFileDefinition(tag)) {
          throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected body to be array of strings or objects, got ${JSON.stringify(tag)}`);
        }
      }
    }
    if (!!parsedContents.nav) {
      if (typeof parsedContents.nav !== 'object') {
        throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected nav to be object, got ${typeof parsedContents.nav}`);
      }
      if (Array.isArray(parsedContents.nav)) {
        throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected nav to be object with either "left" or "right" keys (or both), but got array`);
      }
      if (!!parsedContents.nav.left && !Array.isArray(parsedContents.nav.left)) {
        throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected nav.left to be array, got ${typeof parsedContents.nav.left}`);
      }
      if (!!parsedContents.nav.right && !Array.isArray(parsedContents.nav.right)) {
        throw new Error(`Invalid docoddity.json at ${docoddityPath}: expected nav.right to be array, got ${typeof parsedContents.nav.right}`);
      }
    }
    throw new Error(`Invalid docoddity.json at ${docoddityPath}, but don't know why: ${JSON.stringify(parsedContents)}`);
  }
  return parsedContents;
};

