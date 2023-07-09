import path from 'path';
import {
  _INCLUDES,
  THEMES,
  docoddity_ROOT,
} from './constants.js';
import type {
  FileDefinition,
} from './types.js';
import { transformTags } from './transform-tags.js';

export const getConfigurationFiles = (
  inputDir: string,
  internalDir: string
): {
  docoddity: FileDefinition;
  eleventy: FileDefinition;
} => ({
  docoddity: {
    input: path.join(inputDir, 'docoddity.json'),
    output: path.join(internalDir, '_data/docoddity.json'),
    required: false,
    transform: async (contents): Promise<string> => {
      const parsed = typeof contents === 'string' ? JSON.parse(contents) : contents;
      const headTags = await transformTags(parsed.headTags);
      return JSON.stringify({
        ...parsed,
        headTags,
      });
    },
  },
  eleventy: {
    input: path.join(docoddity_ROOT, 'src/config/eleventy.config.cjs.mustache'),
    output: path.join(internalDir, 'eleventy.config.cjs'),
  },
});

export const getInternalDirectories = (internalDir: string): FileDefinition[] => ([
  {
    input: path.resolve(docoddity_ROOT, _INCLUDES),
    output: path.resolve(internalDir, '_includes'),
  },
  {
    input: path.resolve(docoddity_ROOT, THEMES),
    output: path.resolve(internalDir, 'themes'),
  },
]);

export const getContentDirectories = ({
  inputDir,
  internalDir,
}: {
  inputDir: string;
  internalDir: string;
}): FileDefinition[] => ([
  {
    input: path.resolve(inputDir),
    output: path.resolve(internalDir),
    transform: (content, inputPath) => inputPath.endsWith('.html') ? `
    {% extends "layouts/base.html" %} 
    {% block content %}
    ${content}
    {% endblock %}
    ` : content,
  },
]);
