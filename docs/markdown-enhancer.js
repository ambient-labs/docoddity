// import type { MarkdownEnhancerFn } from 'docoddity';
// const markdownEnhancer: MarkdownEnhancerFn = (md) => {
const markdownEnhancer = (md) => {
  // Custom renderer for code blocks
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    const code = token.content.trim();
    const language = token.info.trim();

    if (['javascript', 'typescript', 'python'].includes(language)) {
      return `<code-editor foo="bar" language="${language}">${code}</code-editor>`;
    }

    return `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`;
  };
}

export default markdownEnhancer;
