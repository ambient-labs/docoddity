import path from 'path';
import pkg from 'fs-extra';
import { HeadTag } from './types.js';
const {
  readFile,
} = pkg;

export const transformTags = async (headTags: HeadTag[] = [], cwd = './') => {
  const result = await Promise.all(headTags.map(async (headTag: Record<string, unknown>) => {
    if ('content' in headTag && typeof headTag.content === 'object') {
      if (headTag.content !== null && 'filename' in headTag.content) {
        const filename = headTag.content.filename;
        if (typeof filename === 'string') {
          if (typeof filename !== 'string') {
            throw new Error(`Invalid filepath: ${filename}`);
          }
          const content = await readFile(path.resolve(cwd, filename), 'utf-8');
          return {
            ...headTag,
            content,
          }
        }
      }
      throw new Error(`Invalid content: ${JSON.stringify(headTag.content)}`);
    }
    return headTag;
  }));
  return result;
};
