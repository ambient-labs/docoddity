import path from 'path';
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
      <div id="article-bottom"></div>
    </article>

    <aside id="toc-desktop">
      ${renderToc(content)}
      <script type="module">
const page = window.document.querySelector('main#page');
const aside = document.querySelector('aside#toc-desktop');
if (page && page instanceof HTMLElement && aside && aside instanceof HTMLElement) {
  const headers = document.querySelectorAll("h2, h3");
  const anchors = aside.querySelectorAll('a');

  let currentlyActive = 0;
  anchors[0].classList.add('active');
  const detectPosition = () => {
    const headerPositions = [...headers].map((header) => header.getBoundingClientRect().top);
    for (let i = 0; i < headerPositions.length; i++) {
      const pos = headerPositions[i];
      if (pos > 0) {
        if (currentlyActive !== i) {
          anchors[currentlyActive].classList.remove('active');
          anchors[i].classList.add('active');
          currentlyActive = i;
        }
        break;
      }
    }
  }
  detectPosition();

  page.addEventListener("scroll", detectPosition);
}

      </script>
    </aside>
  </main>
`,
});
