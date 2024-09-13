import type {
  DocoddityRenderedArgs,
} from '../types.js';
import { renderBase } from './render-base.js';
import { renderToc, renderTocMobile } from './render-toc.js';
import { renderPagination } from './render-pagination.js';
import { renderNavList } from './render-nav-list.js';

const getPageContent = ({
  title,
  content,
  page,
}: DocoddityRenderedArgs): string => `
  <main tabindex="-1" id="page">
    ${renderNavList('left-nav', page.pages, page.url)}
    <article id="page-article" class="markdown-body">
      ${renderTocMobile(content)}
      <div id="content">
        <h1>${title}</h1>
        ${content}
      </div>

      ${renderPagination(page.pages)}
    </article>

    <aside id="toc-desktop">
      ${renderToc(content)}
    </aside>
  </main>
`;

export const renderPage = (args: DocoddityRenderedArgs): string => renderBase({
  ...args,
  content: getPageContent(args),
});
