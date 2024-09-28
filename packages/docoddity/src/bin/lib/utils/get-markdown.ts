import { _INCLUDES } from '../constants.js';
import markdownit from 'markdown-it'
import markdownitFrontMatter from 'markdown-it-front-matter';
import markdownitAnchor from 'markdown-it-anchor';
import type Token from 'markdown-it/lib/token.mjs';

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true
})
  .use(markdownitFrontMatter, () => { })
  .use(markdownitAnchor);

const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

const getHref = (token: Token) => {
  const href = token.attrs?.find(attr => attr[0] === 'href');
  return href ? href[1] : '';
}

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx];
  const href = getHref(token);
  if (href.startsWith('http')) {
    // Add a new `target` attribute, or replace the value of the existing one.
    tokens[idx].attrSet('target', '_blank');
  }

  // Pass the token to the default renderer.
  return defaultRender(tokens, idx, options, env, self);
};

export const getMarkdown = async (content: string) => md.render(content);

export const getMarkdownWithCodeElement = async (_markdown: string | Promise<string> = '') => {
  const markdown = await _markdown;
  return markdown.startsWith('`') && markdown.endsWith('`') ? `<code>${markdown.slice(1, -1)}</code>` : markdown;
};
