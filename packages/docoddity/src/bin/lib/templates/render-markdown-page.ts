import type {
  DocoddityRenderedArgs,
} from '../types.js';
import { renderHTMLPage } from './render-html-page.js';
import { renderToc, renderTocMobile } from './render-toc.js';
import { renderPagination } from './render-pagination.js';
import { renderNavList } from './render-nav-list.js';
import { html } from '../utils/html.js';
import { getMarkdownWithCodeElement } from '../utils/get-markdown.js';

export const renderMarkdownPage = ({
  title,
  content,
  page,
  ...args
}: DocoddityRenderedArgs): Promise<string> => renderHTMLPage({
  title,
  page,
  ...args,
  content: html`
  <main tabindex="-1" id="page">
    ${renderNavList('left-nav', page.pages, page.url)}
    <article id="page-article">
      ${renderTocMobile(content)}
      <div id="content" class="markdown-body">
        <h1>${getMarkdownWithCodeElement(title)}</h1>
        ${content}
      </div>

      ${renderPagination(page.pages)}
    </article>

    <aside id="toc-desktop">
      ${renderToc(content)}
    </aside>
  </main>
`,
});
