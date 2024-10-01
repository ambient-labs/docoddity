import { html } from '../utils/html.js';
import { getIsActive } from '../utils/get-is-active.js';
import {
  isPageDefinitionWithURL,
  type PageDefinitionWithURL,
  type PageDefinition
} from '../types.js';
import { getTitleWithOptionalMarkdownCode } from '../utils/get-title-with-optional-markdown-code.js';

export const renderNavList = async (name: string, navList: PageDefinition[], pageURL: string) => html`
  <nav id="${name}">
    <ul>
      ${navList.map(entry => renderNavListItem(entry, pageURL))}
    </ul>
  </nav>
`;

const buildMenuListAnchorAttributes = (entry: PageDefinitionWithURL, pageURL: string) => {
  const isActive = getIsActive(entry.url, pageURL);
  const classes = ['label', isActive ? 'active' : ''].filter(Boolean).join(' ');
  const attbs = [
    `href="${entry.url}"`,
    `class="${classes}"`,
  ].filter(Boolean).join(' ');
  return attbs;
};

const buildMenuListLabel = (entry: PageDefinition, pageURL: string) => {
  if (isPageDefinitionWithURL(entry)) {
    return html`<a ${buildMenuListAnchorAttributes(entry, pageURL)}>${getTitleWithOptionalMarkdownCode(entry.title)}</a>`;
  }
  return html`<label class="label">${getTitleWithOptionalMarkdownCode(entry.title)}</label>`;
};

const renderNavListItem = (entry: PageDefinition, pageURL: string): Promise<string> => html`
  <li x-data="{ open: ${JSON.stringify(entry.open ?? false)} }" :class="{ open: open }">
    <div class="inner" >
      <div class="menu-list ${entry.url === pageURL ? 'active' : ''}">
        ${buildMenuListLabel(entry, pageURL)}
        ${when(entry.children.length > 0, html`<button @click="open = ! open" class="toggle" aria-label="Toggle the category" type="button"></button>`)}
      </div>
      ${when(entry.children.length > 0, html`
        <ul>
          ${entry.children.map(child => renderNavListItem(child, pageURL))}
        </ul>
      `)}
    </div>
  </li>
`;

const when = (condition: boolean, value: Promise<string>) => condition ? value : '';
