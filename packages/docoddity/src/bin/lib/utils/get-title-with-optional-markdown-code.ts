export const getTitleWithOptionalMarkdownCode = async (_markdown: string | Promise<string> = '') => {
  const markdown = await _markdown;
  return markdown.startsWith('`') && markdown.endsWith('`') ? `<code>${markdown.slice(1, -1)}</code>` : markdown;
};
