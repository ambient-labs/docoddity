import { setupBuild } from '../includes/setup-build.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Markdown page', () => {
  const configureDocodditySite = setupBuild({
    std: {
      // stdout: chunk => console.log('[Docoddity]', chunk),
      // stderr: chunk => console.error('[Docoddity]', chunk),
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

  test('it should strip index from page url', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `docs/index.md`,
        content: getMarkdownContent('index', { title: 'Index Title', order: 0, }),
      },
      {
        filepath: `docs/one.md`,
        content: getMarkdownContent('one body', { title: 'One Title', order: 1, }),
      },
      {
        filepath: `docs/two.md`,
        content: getMarkdownContent('two body', { title: 'Two Title', order: 2, }),
      },
    ]);

    // await printURL(1000, '/docs/two');

    await runner.goto('/docs/');
    await expect(runner).toMatchPage({
      pageTitle: 'Index Title',
      bodyText: 'index',
      leftNav: [
        { href: '/docs/', text: 'Index Title', },
        { href: '/docs/one', text: 'One Title', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      prevHTML: undefined,
      nextHTML: 'One Title',
      bodyH1: 'Index Title',
    });

    await runner.goto('/docs/one');
    await expect(runner).toMatchPage({
      pageTitle: 'One Title',
      bodyText: 'one body',
      leftNav: [
        { href: '/docs/', text: 'Index Title', },
        { href: '/docs/one', text: 'One Title', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      prevHTML: 'Index Title',
      nextHTML: 'Two Title',
      bodyH1: 'One Title',
    });
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

    await runner.goto('/docs/two');

    await expect(runner).toMatchPage({
      pageTitle: 'Two Title',
      bodyText: 'two body',
      leftNav: [
        { href: '/docs/one', text: '<code>code</code>', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      prevHTML: '<code>code</code>',
      nextHTML: undefined,
      bodyH1: 'Two Title',
    });

    await runner.goto('/docs/one');
    await expect(runner).toMatchPage({
      pageTitle: 'code',
      bodyText: 'one body',
      leftNav: [
        { href: '/docs/one', text: '<code>code</code>', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      prevHTML: undefined,
      nextHTML: 'Two Title',
      bodyH1: '<code>code</code>',
    });
  });

  test('it should strip single quotes from title', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `docs/one.md`,
        content: getMarkdownContent('one body', { title: 'code', order: 0, }),
      },
      {
        filepath: `docs/two.md`,
        content: getMarkdownContent('two body', { title: "'Two Title'", order: 1, }),
      },
    ]);

    await runner.goto('/docs/two');

    await expect(runner).toMatchPage({
      pageTitle: 'Two Title',
      leftNav: [
        { href: '/docs/one', text: 'code', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      bodyH1: 'Two Title',
    });

    await runner.goto('/docs/one');

    await expect(runner).toMatchPage({
      nextHTML: 'Two Title',
    });

  });

  test('it should strip double quotes from title', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `docs/one.md`,
        content: getMarkdownContent('one body', { title: 'code', order: 0, }),
      },
      {
        filepath: `docs/two.md`,
        content: getMarkdownContent('two body', { title: '"Two Title"', order: 1, }),
      },
    ]);

    await runner.goto('/docs/two');

    await expect(runner).toMatchPage({
      pageTitle: 'Two Title',
      leftNav: [
        { href: '/docs/one', text: 'code', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      bodyH1: 'Two Title',
    });

    await runner.goto('/docs/one');

    await expect(runner).toMatchPage({
      nextHTML: 'Two Title',
    });

  });

  test('it should preserve lowercase in page title', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `docs/one.md`,
        content: getMarkdownContent('one body', { title: 'code', order: 0, }),
      },
      {
        filepath: `docs/two.md`,
        content: getMarkdownContent('two body', { title: 'Two Title', order: 1, }),
      },
    ]);

    await runner.goto('/docs/two');
    await expect(runner).toMatchPage({
      pageTitle: 'Two Title',
      bodyText: 'two body',
      leftNav: [
        { href: '/docs/one', text: 'code', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      prevHTML: 'code',
      nextHTML: undefined,
      bodyH1: 'Two Title',
    });

    await runner.goto('/docs/one');
    await expect(runner).toMatchPage({
      pageTitle: 'code',
      bodyText: 'one body',
      leftNav: [
        { href: '/docs/one', text: 'code', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      prevHTML: undefined,
      nextHTML: 'Two Title',
      bodyH1: 'code',
    });

  });

  test('it should render active pages in left nav', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `docs/index.md`,
        content: getMarkdownContent('one body', { title: 'One Title', order: 0, }),
      },
      {
        filepath: `docs/two.md`,
        content: getMarkdownContent('two body', { title: 'Two Title', order: 1, }),
      },
      {
        filepath: `docs/three.md`,
        content: getMarkdownContent('three body', { title: 'Three Title', order: 2, }),
      },
    ]);
    await runner.goto(`/docs/`);
    // await printURL(1000, '/docs');
    await expect(runner).toMatchPage({
      leftNav: [
        { href: '/docs/', text: 'One Title', class: 'active', },
        { href: '/docs/two', text: 'Two Title', },
        { href: '/docs/three', text: 'Three Title', },
      ],
    })
    await runner.goto(`/docs/two`);
    await expect(runner).toMatchPage({
      leftNav: [
        { href: '/docs/', text: 'One Title', },
        { href: '/docs/two', text: 'Two Title', class: 'active', },
        { href: '/docs/three', text: 'Three Title', },
      ],
    })
    await runner.goto(`/docs/three`);
    await expect(runner).toMatchPage({
      leftNav: [
        { href: '/docs/', text: 'One Title', },
        { href: '/docs/two', text: 'Two Title', },
        { href: '/docs/three', text: 'Three Title', class: 'active' },
      ],
    })
  });

  // test.only('it should render nested active pages in left nav', async () => {
  //   const { runner, printURL } = await configureDocodditySite([
  //     {
  //       filepath: `docs/index.md`,
  //       content: getMarkdownContent('one body', { title: 'One Title', order: 0, }),
  //     },
  //     {
  //       filepath: `docs/two/index.md`,
  //       content: getMarkdownContent('two body', { title: 'Two Index Title', order: 1, }),
  //     },
  //     {
  //       filepath: `docs/two/a.md`,
  //       content: getMarkdownContent('two a body', { title: 'Two A Title', order: 1, }),
  //     },
  //     {
  //       filepath: `docs/three.md`,
  //       content: getMarkdownContent('three body', { title: 'Three Title', order: 2, }),
  //     },
  //   ]);
  //   await printURL(1000, '/docs/');
  //   await runner.goto(`/docs/two`);
  //   await expect(runner).toMatchQuerySelectorAll('#left-nav a', [
  //     '<a href="/docs/index" class="active">One Title</a>',
  //     '<a href="/docs/two">Two Title</a>',
  //     '<a href="/docs/three">Three Title</a>',
  //   ]);
  // });
});
