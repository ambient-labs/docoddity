import { html } from '../utils/html.js';
import { getMarkdownWithCodeElement } from "../utils/get-markdown.js";

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
      <a href="${entry.url}">${getMarkdownWithCodeElement(entry.title)}</a>
      ${when(entry.children.length > 0, `
        <button class="toggle" aria-label="Toggle the category" type="button"></button>
      `)}
    </div>
    ${when(entry.children.length > 0, `
    <ul>
      ${entry.children.map(child => renderNavListItem(child)).join('\n')}
    </ul>`)}
    </div>
  </li>
`;

const when = (condition: boolean, value: string) => condition ? value.trim() : '';
