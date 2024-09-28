import type {
  DocoddityNavItem,
  DocoddityRenderedArgs,
} from '../types.js';
import { html } from '../utils/html.js';

import { renderNavList } from './render-nav-list.js';

const externalLinkSVG = html`
  <svg width="13.5" height="13.5" aria-hidden="true" viewBox="0 0 24 24" class="iconExternalLink_Oi63">
  <path fill="currentColor" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"></path>
  </svg>
`;

const renderNavItem = (pageUrl: string) => (item: DocoddityNavItem) => {
  const active = pageUrl.startsWith(item.url) && item.url !== '/' ? 'active' : undefined;
  const mobile = item.mobile ? 'mobile' : undefined;
  const isExternal = pageUrl.startsWith('http');
  const rel = item.rel ? item.rel : isExternal ? 'noopener noreferrer' : '';
  const target = item.target ? item.target : isExternal ? '_blank' : '';
  return html`
    <a 
      href="${item.url}" 
    class="${[active, mobile, item.class].filter(Boolean).join(' ')}"
      ${target}
      ${rel}
      ${item.ariaLabel ? `aria-label="${item.ariaLabel}"` : ''}
    >
      ${item.text}
      ${isExternal ? externalLinkSVG : ''}
    </a>
    `;
};

const renderNavItems = (pageUrl: string, items: DocoddityNavItem[] = []) => items.map(renderNavItem(pageUrl));

const renderMobileMenu = ({
  page,
  docoddity,
}: Pick<DocoddityRenderedArgs, 'page' | 'docoddity'>) => html`
  <div id="hamburger-menu">
    <div id="hamburger-menu-overlay"></div>
    <div id="hamburger-contents">
      <header>
        <div id="left">
          <a class="title" aria-role="title" href="/">${docoddity.title ?? ''}</a>
          <theme-toggle></theme-toggle>

        </div>
        <button id="close-hamburger" type="button" aria-label="Close navigation bar">
          <svg viewBox="0 0 15 15" width="21" height="21"><g stroke-width="1.2"><path d="M.75.75l13.5 13.5M14.25.75L.75 14.25"></path></g></svg>
        </button>
      </header>

      <main>
        ${page.pages.length > 1 ? `
          <section>
            <button type="button" id="back-to-main-menu">← Back to main menu</button>
            ${renderNavList('hamburger-nav', page.pages, page.url)}
          </section>
          ` : ''}


        <section>
          ${renderNavItems(page.url, docoddity.nav?.left)}
          <hr />
          ${renderNavItems(page.url, docoddity.nav?.right)}
        </section>
      </main>
    </div>
  </div>
`;

const renderDesktopMenu = ({
  page,
  docoddity,
}: Pick<DocoddityRenderedArgs, 'page' | 'docoddity'>) => html`
    <header role="banner" class="site-head desktop">
      <div id="left">
        <button 
          id="hamburger"
          class="mobile"
          aria-label="Toggle navigation bar" 
          aria-expanded="false" 
          type="button"
        >
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
            <path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" d="M4 7h22M4 15h22M4 23h22"></path>
          </svg>
        </button>

        <a class="title" aria-role="title" class="mobile" href="/">${docoddity.title ?? ''}</a>

        ${renderNavItems(page.url, docoddity.nav?.left)}
      </div>

      <div id="right">
        ${renderNavItems(page.url, docoddity.nav?.right)}
        <theme-toggle></theme-toggle>
        <div class="mobile" id="docsearch"></div>
      </div>
    </header>
  `;

export const renderBodyHeader = (args: Pick<DocoddityRenderedArgs, 'page' | 'docoddity'>) => html`
  <!-- mobile menu -->
  ${renderMobileMenu(args)}

  <!-- desktop menu -->
  ${renderDesktopMenu(args)}
`;
