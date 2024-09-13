import path from 'path';
import {
  readFile
} from "./fs.js";
import {
  type DocoddityFileDefinition,
  isTagDefinition,
  isTagDefinitionWithFilepathContent,
  isTagDefinitionWithStringContent,
  type TagDefinition,
  type TagDefinitionWithStringContent,
  type ValidTagValue
} from "../types.js";
import { exists } from 'fs-extra';

const getTagDefinition = (rootDir: string, file: DocoddityFileDefinition): TagDefinition => {
  if (isTagDefinition(file)) {
    return file;
  }
  // try to auto guess
  if (typeof file.src === 'string' && (file.src.endsWith('.js') || file.src.endsWith('.ts'))) {
    return {
      type: 'module',
      tag: 'script' as 'script',
      ...file,
      src: getLink(rootDir, file.src),
    }
  } else if (typeof file.href === 'string' && file.href.endsWith('.css')) {
    return {
      ...file,
      rel: 'stylesheet',
      href: getLink(rootDir, file.href),
      tag: 'link',
    }
  }
  throw new Error(`Tag definition must have a "tag" property: ${JSON.stringify(file)}`);
}

const populateContent = async (tagDef: TagDefinition, rootDir: string): Promise<TagDefinitionWithStringContent> => {
  if (isTagDefinitionWithFilepathContent(tagDef)) {
    const filepath = path.resolve(rootDir, tagDef.content.filename);
    if (!(await exists(filepath))) {
      throw new Error(`File does not exist: ${filepath}`);
    }
    const content = await readFile(filepath);
    return {
      ...tagDef,
      content,
    };
  } else if (isTagDefinitionWithStringContent(tagDef)) {
    return tagDef;
  }
  if (tagDef.tag === 'script' && typeof tagDef.src === 'string') {
    const t = {
      ...tagDef,
      src: getLink(rootDir, tagDef.src),
      content: '',
    };
    return t;
  } else if (tagDef.tag === 'link' && typeof tagDef.href === 'string') {
    return {
      rel: 'stylesheet',
      ...tagDef,
      href: getLink(rootDir, tagDef.href),
      content: '',
    };
  }
  return {
    ...tagDef,
    content: '',
  }
  // throw new Error(`Tag definition must have a valid "content" property: ${JSON.stringify(tagDef)}`);
};

export const getFnToGetTagForTemplateRendering = (
  rootDir: string,
  additionalAttributes: Record<string, ValidTagValue> = {},
) => async (file: string | DocoddityFileDefinition): Promise<TagDefinitionWithStringContent | string> => {
  if (typeof file !== 'string') {
    const tagDef = getTagDefinition(rootDir, file);
    return await populateContent({
      ...additionalAttributes,
      ...tagDef,
    }, rootDir);
  }
  if (file.endsWith('.js') || file.endsWith('.ts')) {
    return {
      type: 'module',
      ...additionalAttributes,
      src: getLink(rootDir, file),
      tag: 'script',
    }
  } else if (file.endsWith('.css')) {
    return {
      ...additionalAttributes,
      href: getLink(rootDir, file),
      rel: 'stylesheet',
      tag: 'link',
    }
  }
  return file;
};

const getLink = (rootDir: string, file: string) => file.startsWith('http') || file.startsWith('data:') ? file : path.resolve(rootDir, file);
