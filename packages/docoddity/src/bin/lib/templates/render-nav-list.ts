export const renderNavList = (name: string, navList: NavListItem[], pageURL: string): string => `
  <nav id="${name}">
    <ul>
      ${navList.map(entry => renderNavListItem(entry, pageURL).trim()).join('\n')}
    </ul>
  </nav>
`;

export interface NavListItem {
  url: string;
  title: string;
  children: NavListItem[];
}

const renderNavListItem = (entry: NavListItem, pageURL?: string): string => `
  <li class="open">
    <div class="inner">
    <div class="menu-list ${entry.url === pageURL ? 'active' : ''}">
      <a href="${entry.url}">${entry.title}</a>
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
