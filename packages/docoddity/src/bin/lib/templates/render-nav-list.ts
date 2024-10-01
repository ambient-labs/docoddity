import { html } from '../utils/html.js';
import { getIsActive } from '../utils/get-is-active.js';
import type { PageDefinition } from '../types.js';
import { getTitleWithOptionalMarkdownCode } from '../utils/get-title-with-optional-markdown-code.js';

export const renderNavList = async (name: string, navList: PageDefinition[], pageURL: string) => html`
  <nav id="${name}">
    <ul>
      ${navList.map(entry => renderNavListItem(entry, pageURL))}
    </ul>
  </nav>
`;

const buildMenuListAnchorAttributes = (entry: PageDefinition, pageURL: string) => {
  const isActive = getIsActive(entry.url, pageURL);
  const attbs = [
    `href="${entry.url}"`,
    isActive ? 'class="active"' :
      ''
  ].filter(Boolean).join(' ');
  return attbs;
};

const renderNavListItem = (entry: PageDefinition, pageURL: string): Promise<string> => html`
  <li x-data="{ open: ${JSON.stringify(entry.open ?? false)} }" :class="{ open: open }">
    <div class="inner">
    <div class="menu-list ${entry.url === pageURL ? 'active' : ''}">
      <a ${buildMenuListAnchorAttributes(entry, pageURL)}>${getTitleWithOptionalMarkdownCode(entry.title)}</a>
      ${when(entry.children.length > 0, html`
        <button @click="open = ! open" class="toggle" aria-label="Toggle the category" type="button"></button>
      `)}
    </div>
    ${when(entry.children.length > 0, html`
    <ul>
      ${entry.children.map(child => renderNavListItem(child, pageURL))}
    </ul>`)}
    </div>
  </li>
`;

const when = (condition: boolean, value: Promise<string>) => condition ? value : '';
