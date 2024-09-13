// test/my-library-test.js

import { setupBuild } from '../includes/setup-build.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Content', () => {
  const configureDocodditySite = setupBuild({
    std: {
      // stdout: console.log,
      // stderr: console.error,
    }
  });

  describe('Markdown page', () => {
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

  describe('HTML page', () => {
    test('it should render an HTML page without a docoddity.json', async () => {
      const pagePath = 'html-page';
      const content = 'foobar';
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `${pagePath}.html`,
          content: `
              <p>${content}</p>
    `,
        },
      ]);
      await runner.goto(`/${pagePath}`);
      const [title, container] = await runner.page.evaluate(() => [
        window.document.title,
        window.document.querySelector('body p')?.innerText,
      ]);
      expect(title).toEqual('');
      expect(container).toEqual(content);
    });

    test('it should render an HTML page with a docoddity.json', async () => {
      const siteTitle = 'Basic Site';
      const pagePath = 'html-page';
      const content = 'foobar';
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `${pagePath}.html`,
          content: `
              <p>${content}</p>
    `,
        },
        {
          filepath: 'docoddity.json',
          content: {
            title: siteTitle,
          },
        }
      ]);
      await runner.goto(`/${pagePath}`);
      const [title, container] = await runner.page.evaluate(() => [
        window.document.title,
        window.document.querySelector('body p')?.innerText,
      ]);
      expect(title).toEqual(siteTitle);
      expect(container.split(siteTitle).join('').trim()).toEqual(content);
    });


    test('it should render a root HTML page', async () => {
      const siteTitle = 'Basic Site';
      const content = 'foobar';
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `index.html`,
          content: `
              <p>${content}</p>
    `,
        },
        {
          filepath: 'docoddity.json',

          content: {
            title: siteTitle,
          },
        }
      ]);
      const [title, container] = await runner.page.evaluate(() => [
        window.document.title,
        window.document.querySelector('body p')?.innerText,
      ]);
      expect(title).toEqual(siteTitle);
      expect(container.split(siteTitle).join('').trim()).toEqual(content);
    });
  });
});
