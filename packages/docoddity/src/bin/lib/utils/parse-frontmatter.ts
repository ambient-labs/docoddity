// import yaml from 'js-yaml';
import type { Frontmatter } from '../types.js';

export type ParsedFrontmatter = Record<string, unknown>;


const parseYamlFrontmatter = (content: string = ''): ParsedFrontmatter => {
  const lines = content.split('\n').filter(Boolean).map(l => l.trim());
  const keyVals = lines.map(l => l.split(':')).map(([
    key,
    ...value
  ]) => [key.trim(), value.join(':').trim()]);
  return keyVals.reduce((acc, [key, value]) => ({
    ...acc,
    [key]: value,
  }), {});
};

export const parseFrontmatter = async (content: string = ''): Promise<Frontmatter> => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatter = match[1];
    if (frontmatter) {
      const parsedFronmatter = parseYamlFrontmatter(frontmatter);
      const { title, order: _order, ...rest } = parsedFronmatter;
      const order = Number(_order);
      return {
        ...rest,
        title: typeof title === 'string' ? parseTitle(title) : undefined,
        order: Number.isNaN(order) ? undefined : order,
      }
    }

  }
  return {};
};

const parseTitle = (title: string) => {
  if ((title.startsWith("'") && title.endsWith("'")) || (title.startsWith('"') && title.endsWith('"'))) {
    return title.slice(1, -1);
  }
  return title;
};
