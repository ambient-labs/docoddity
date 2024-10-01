import type {
  PageDefinition,
} from '../types.js';
import { getTitleWithOptionalMarkdownCode } from '../utils/get-title-with-optional-markdown-code.js';
import { html } from '../utils/html.js';

export const renderPaginationButton = (label: string, ariaRole: string, page?: PageDefinition) => page ? html`
  <a class="button" href="${page.url}" aria-role="${ariaRole}">
    <label>${label}</label>
    <span>${getTitleWithOptionalMarkdownCode(page.title)}</span>
  </a>
` : ``;

export const renderPagination = (pages: PageDefinition[]) => {
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
