import { html } from "../utils/html.js";

export const renderTocMobile = (content: string | Promise<string>) => html`
  <aside 
    id="toc-mobile" x-data="{ open: false }" 
    :class="{ 'open': open }"
    class="open" @click.outside="open = false"
  >
    <div class="inner">
      <label>
        <span>On this page</span> 
        <button id="toggle-toc" class="toggle" aria-label="Toggle the ToC" type="button" @click="open = ! open"></button>
      </label>
      ${renderToc(content)}
    </div>
  </aside>
`;

const getHeadings = async (content: string | Promise<string>) => ((await content).match(/<h[1-6][^>]*>.*?<\/h[1-6]>/g) || []).map((heading) => {
  const id = heading.match(/id="([^"]*)"/)?.[1] || '';
  const text = heading.replace(/<[^>]*>/g, '');
  const level = heading.match(/<h([1-6])/)?.[1] || '1';
  return {
    id,
    text,
    level,
  };
});

export const renderToc = async (content: string | Promise<string>) => html`
  <div class="toc">
    <ol>
      ${(await getHeadings(content)).map(({ id, text, level }) => `
        <li class="indent-${level}">
          <a href="#${id}">${text}</a>
        </li>
      `).join('\n')}
    </ol>
  </div>
`;
