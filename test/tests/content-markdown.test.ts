import { setupBuild } from '../includes/setup-build.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Markdown page', () => {
  const configureDocodditySite = setupBuild({
    std: {
      stdout: console.log,
      stderr: console.error,
    }
  });
  test('it should render a markdown page without a docoddity.json', async () => {
    const pageTitle = 'Markdown Page Title';
    const pagePath = 'markdown-page';
    const content = 'foobar';
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `${pagePath}.md`,
        content: getMarkdownContent(content, { title: pageTitle }),
      },
    ]);
    await runner.goto(`/${pagePath}`);
    const [title, h1, p] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('#content h1')?.innerText,
      window.document.querySelector('#content p')?.innerText,
    ]);
    expect(title).toEqual(pageTitle);
    expect(h1).toEqual(pageTitle);
    expect(p).toEqual(content);
  });

  test('it should default to the page name if no title is provided', async () => {
    const pagePath = 'markdown-page';
    const content = 'foobar';
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `${pagePath}.md`,
        content: getMarkdownContent(content),
      },
    ]);
    await runner.goto(`/${pagePath}`);
    const [title, h1, p] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('#content h1')?.innerText,
      window.document.querySelector('#content p')?.innerText,
    ]);
    expect(title).toEqual('Markdown Page');
    expect(h1).toEqual('Markdown Page');
    expect(p).toEqual(content);
  });

  test('it should render a markdown page with a docoddity.json', async () => {
    const siteTitle = 'Basic Site';
    const pageTitle = 'Markdown Page Title';
    const pagePath = 'markdown-page';
    const content = 'foobar';
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `${pagePath}.md`,
        content: getMarkdownContent(content, { title: pageTitle }),
      },

      {
        filepath: 'docoddity.json',
        content: {
          title: siteTitle,
        },
      }
    ]);
    await runner.goto(`/${pagePath}`);
    const [title, h1, p] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('#content h1')?.innerText,
      window.document.querySelector('#content p')?.innerText,
    ]);
    expect(title).toEqual([pageTitle, siteTitle].join(' | '));
    expect(h1).toEqual(pageTitle);
    expect(p).toEqual(content);
  });

  test('it should render a root markdown page', async () => {
    const pageTitle = 'Markdown Page Title';
    const content = 'foobar';
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: pageTitle }),
      },
    ]);
    const [title, h1, p] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('#content h1')?.innerText,
      window.document.querySelector('#content p')?.innerText,
    ]);
    expect(title).toEqual(pageTitle);
    expect(h1).toEqual(pageTitle);
    expect(p).toEqual(content);
  });

  test('it should process markdown in page title', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `docs/one.md`,
        content: getMarkdownContent('one body', { title: '`code`', order: 0, }),
      },
      {
        filepath: `docs/two.md`,
        content: getMarkdownContent('two body', { title: 'Two Title', order: 1, }),
      },
    ]);

    // await printURL(1000, '/docs/two');

    const expectPage = async (title: string, container: string, nav: string[], prev: string, next: string, pageTitle: string, url?: string) => {
      if (url) {
        await runner.goto(url);
      }
      const results = await runner.page.evaluate(() => {
        const prev = window.document.querySelector('a[aria-role="prev"] span');
        const next = window.document.querySelector('a[aria-role="next"] span');
        return [
          window.document.title,
          window.document.querySelector('article#page-article p')?.innerHTML,
          Array.from(window.document.querySelectorAll('nav#left-nav a')).map(el => el.outerHTML.trim()),
          prev ? prev.innerHTML : undefined,
          next ? next.innerHTML : undefined,
          window.document.querySelector('article#page-article h1')?.innerHTML,
        ];
      });
      expect(results[0]).toEqual(title);
      expect(results[1]).toEqual(container);
      expect(results[2]).toEqual(nav);
      expect(results[3]).toEqual(prev);
      expect(results[4]).toEqual(next);
      expect(results[5]).toEqual(pageTitle);
    };


    await expectPage('Two Title', 'two body', [
      "<a href=\"/docs/one\"><code>code</code></a>",
      "<a href=\"/docs/two\">Two Title</a>",
    ], '<code>code</code>', undefined, 'Two Title', '/docs/two');

    await expectPage('code', 'one body', [
      "<a href=\"/docs/one\"><code>code</code></a>",
      "<a href=\"/docs/two\">Two Title</a>",
    ], undefined, 'Two Title', '<code>code</code>', '/docs/one');

  });
});
