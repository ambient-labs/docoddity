import { setupBuild } from '../includes/setup-build.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Markdown page', () => {
  const configureDocodditySite = setupBuild({
    std: {
      // stdout: console.log,
      // stderr: console.error,
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
});
