import type {
  Page,
} from '../types.js';

export const renderPaginationButton = (label: string, ariaRole: string, page?: Page): string => page ? `
  <a class="button" href="${page.url}" aria-role="${ariaRole}">
    <label>${label}</label>
    <span>${page.title}</span>
  </a>
` : ``;

export const renderPagination = (pages: Page[]): string => {
  if (!pages?.length) {
    return ``;
  }
  const index = pages.findIndex((page) => page.current);
  const prev = index > 0 ? pages[index - 1] : undefined;
  const next = index < pages.length - 1 ? pages[index + 1] : undefined;
  if (!prev && !next) {
    return ``;
  }
  return `
    <div id="pagination">
      <div class="left">${renderPaginationButton('Previous', 'prev', prev)}</div>
      <div class="right">${renderPaginationButton('Next', 'next', next)}</div>
    </div>
  `;
};
