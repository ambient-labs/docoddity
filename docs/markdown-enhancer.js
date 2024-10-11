
// `createHighlighter` is async, it initializes the internal and
// loads the themes and languages specified.
// import type { MarkdownEnhancerFn } from 'docoddity';
// const markdownEnhancer: MarkdownEnhancerFn = (md) => {
const markdownEnhancer = async (md) => {
  const { createHighlighter } = await import('shiki');
  const HIGHLIGHTER_LANGUAGES = [
    'sql',
    'javascript',
    'typescript',
    'bash',
    'python',
    'html',
  ];
  const highlighter = await createHighlighter({
    themes: ['github-dark', 'github-dark-default', 'catppuccin-latte', 'nord'],
    // themes: ['nord'],
    langs: HIGHLIGHTER_LANGUAGES,
  });
  // Custom renderer for code blocks
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const code = token.content.trim();
    const language = token.info.trim();

    const html = highlighter.codeToHtml(code, {
      lang: language,
      // theme: 'nord',
      // theme: 'catppuccin-latte',
      themes: {
        light: 'catppuccin-latte',
        dark: 'github-dark',
      },
      colorReplacements: {
        'github-dark': {
          '#24292e': '#151818'
        },
      }
    })
    return `<copy-to-clipboard>${html}</copy-to-clipboard>`;
  };
}

export default markdownEnhancer;
