import { html } from '../utils/html.js';
import { getMarkdownWithCodeElement } from "../utils/get-markdown.js";
import { getIsActive } from './render-body-header.js';

export const renderNavList = async (name: string, navList: NavListItem[], pageURL: string) => html`
  <nav id="${name}">
    <ul>
      ${navList.map(entry => renderNavListItem(entry, pageURL))}
    </ul>
  </nav>
`;

export interface NavListItem {
  url: string;
  title: string;
  children: NavListItem[];
}

const renderNavListItem = (entry: NavListItem, pageURL?: string): Promise<string> => html`
  <li class="open">
    <div class="inner">
    <div class="menu-list ${entry.url === pageURL ? 'active' : ''}">
      <a ${[`href="${entry.url}"`, getIsActive(entry.url, pageURL) ? 'class="active"' : ''].filter(Boolean).join(' ')}>${getMarkdownWithCodeElement(entry.title)}</a>
      ${when(entry.children.length > 0, html`
        <button class="toggle" aria-label="Toggle the category" type="button"></button>
      `)}
    </div>
    ${when(entry.children.length > 0, html`
    <ul>
      ${entry.children.map(child => renderNavListItem(child))}
    </ul>`)}
    </div>
  </li>
`;

const when = (condition: boolean, value: Promise<string>) => condition ? value : '';
