// test/my-library-test.js

import { setup } from '../includes/setup.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';


describe('Content', () => {
  const configureDocodditySite = setup();

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
      const title = await runner.page.evaluate(() => window.document.title);
      expect(title).toEqual(pageTitle);
      const h1 = await runner.page.evaluate(() => { return window.document.querySelector('#content h1')?.innerText; });
      expect(h1).toEqual(pageTitle);
      const p = await runner.page.evaluate(() => { return window.document.querySelector('#content p')?.innerText; });
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
      const title = await runner.page.evaluate(() => window.document.title);
      expect(title).toEqual([pageTitle, siteTitle].join(' | '));
      const h1 = await runner.page.evaluate(() => { return window.document.querySelector('#content h1')?.innerText; });
      expect(h1).toEqual(pageTitle);
      const p = await runner.page.evaluate(() => { return window.document.querySelector('#content p')?.innerText; });
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
      const title = await runner.page.evaluate(() => window.document.title);
      expect(title).toEqual(pageTitle);
      const h1 = await runner.page.evaluate(() => { return window.document.querySelector('#content h1')?.innerText; });
      expect(h1).toEqual(pageTitle);
      const p = await runner.page.evaluate(() => { return window.document.querySelector('#content p')?.innerText; });
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
      const title = await runner.page.evaluate(() => window.document.title);
      expect(title).toEqual('');
      const container = await runner.page.evaluate(() => { return window.document.querySelector('body')?.innerText; });
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
      const title = await runner.page.evaluate(() => window.document.title);
      expect(title).toEqual(siteTitle);
      const container = await runner.page.evaluate(() => { return window.document.querySelector('body')?.innerText; });
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
      const title = await runner.page.evaluate(() => window.document.title);
      expect(title).toEqual(siteTitle);
      const container = await runner.page.evaluate(() => { return window.document.querySelector('body')?.innerText; });
      expect(container.split(siteTitle).join('').trim()).toEqual(content);
    });
  });
});
