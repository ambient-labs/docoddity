import { _INCLUDES } from '../constants.js';
import { micromark } from 'micromark';
import { frontmatter, frontmatterHtml } from 'micromark-extension-frontmatter';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

import { rehype } from 'rehype';
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug';


const getMarkdownWithAnchorHeadings = async (content: string) => String(await rehype()
  .data('settings', { fragment: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings)
  .process(`${content}`));

export const getMarkdown = async (content: string) => await getMarkdownWithAnchorHeadings(micromark(content, {
  allowDangerousHtml: true,
  extensions: [gfm(), frontmatter()],
  htmlExtensions: [gfmHtml(), frontmatterHtml()]
}));
