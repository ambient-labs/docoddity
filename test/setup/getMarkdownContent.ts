const getIndent = (depth: number) => new Array(depth * 2).fill(' ').join("");
export type FrontmatterOpts = Record<string, string | number | FrontmatterOpts>;
const buildFrontmatter = (frontmatter: FrontmatterOpts, depth = 1) => {
  return Object.entries(frontmatter).map(([key, val]) => {
    if (typeof val === 'string' || typeof val === 'number') {
      return `${key}: ${val}`;
    }
    return [
      `${key}:`,
      ...buildFrontmatter(val).split('\n').map(l => `${getIndent(depth)}${l}`, depth + 1),
    ].join('\n');
  }).join('\n');
}
export const getMarkdownContent = (content: string, opts: FrontmatterOpts = {}) => `---
${buildFrontmatter({ ...opts })}
---

${content}
`;
