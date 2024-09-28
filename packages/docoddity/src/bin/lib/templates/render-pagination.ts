import type {
  Page,
} from '../types.js';
import { getMarkdownCode } from '../utils/get-markdown.js';
import { html } from '../utils/html.js';

export const renderPaginationButton = (label: string, ariaRole: string, page?: Page) => page ? html`
  <a class="button" href="${page.url}" aria-role="${ariaRole}">
    <label>${label}</label>
    <span>${getMarkdownCode(page.title)}</span>
  </a>
` : ``;

export const renderPagination = (pages: Page[]) => {
  if (!pages?.length) {
    return html``;
  }
  const index = pages.findIndex((page) => page.current);
  const prev = index > 0 ? pages[index - 1] : undefined;
  const next = index < pages.length - 1 ? pages[index + 1] : undefined;
  if (!prev && !next) {
    return html``;
  }
  return html`
    <div id="pagination">
      <div class="left">${renderPaginationButton('Previous', 'prev', prev)}</div>
      <div class="right">${renderPaginationButton('Next', 'next', next)}</div>
    </div>
  `;
};
