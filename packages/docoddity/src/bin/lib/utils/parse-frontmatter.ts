import yaml from 'js-yaml';

export function parseFrontmatter(content: string = ''): Record<string, any> {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatter = match[1];
    if (frontmatter) {
      return yaml.load(frontmatter) as Record<string, any>;
    }
  }

  return {};
}
