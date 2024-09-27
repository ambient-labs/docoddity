import * as url from 'url';
import {
  writeFile as _writeFile,
  readFile,
} from 'fs-extra';
import { setupBuild } from '../includes/setup-build.js';

import path from 'path';
import { TagDefinition } from '../setup/matchers/toContainTags.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';
import { getActions } from '../includes/getActions.js';
import { DocoddityTestFile } from '../includes/types.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

describe('Themes', () => {
  const configureDocodditySite = setupBuild({
    std: {
      // stdout: console.log,
      // stderr: console.error,
    }
  });

  const content = {
    filepath: `index.html`,
    content: `
              <p>foobar</p>
    `,
  };

  describe('Default Theme', () => {
    test('it loads the default theme', async () => {
      const { runner, printURL } = await configureDocodditySite([
        content,
      ]);
      const [shoelaceConfig, importMap] = await Promise.all([
        'packages/docoddity/src/themes/default/shoelace-config.js',
        'packages/docoddity/src/themes/default/importmap.json',
      ].map(filepath => readFile(path.resolve(ROOT, filepath), 'utf-8')));

      const urls: TagDefinition[] = [
        // `link[href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace/dist/themes/light.css"]`,
        // `link[href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace/dist/themes/dark.css"]`,
        { url: `script[type="importmap"]`, contents: importMap.trim() },
        // ...[
        //   'reset.css',
        //   'github-markdown.css',
        //   'variables.css',
        //   'style.css',
        // ].map(style => `link[href="/theme/default/styles/${style}"][data-file="theme"][rel="stylesheet"]`),
        // `script[async=false][defer=false][type="module"][src="/scripts/index.ts"][data-file="theme"]`,
      ];
      // await printURL(10000);
      await expect(runner.page).toContainTags(urls, { trim: true });
    });

    test('it loads the page nav on an HTML page', async () => {
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `index.html`,
          content,
        },
      ]);

      const selectors = [
        '#hamburger-menu',
        'header[role="banner"]',
      ];
      const [mobileStyle, ...exists] = await runner.page.evaluate((selectors) => [
        window.getComputedStyle(window.document.querySelector(selectors[0])),
        ...selectors.map(selector =>
          !!window.document.querySelector(selector),
        ),
      ], selectors);
      // await printURL(1000);
      expect(exists).toEqual([true, true]);
      expect(mobileStyle.display).toEqual('none');
      runner.page.setViewportSize({ width: 600, height: 600 });
      const mobileStyleVisible = await runner.page.evaluate((selector) => window.getComputedStyle(window.document.querySelector(selector)), selectors[0]);
      expect(mobileStyleVisible.display).toEqual('block');

    });

    test('it loads correct pieces of page nav on an HTML page', async () => {
      const title = 'foobarbaz1';
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `index.html`,
          content,
        },
        {
          filepath: 'docoddity.json',
          content: {
            title,
          },
        },
      ]);

      const selectors = [
        '#hamburger-menu a[aria-role="title"]',
        'header[role="banner"] a[aria-role="title"]',
      ];
      const [mobileTitle, desktopTitle] = await runner.page.evaluate((selectors) => selectors.map(selector =>
        window.document.querySelector(selector)?.innerHTML,
      ), selectors);
      expect(mobileTitle).toEqual(title);
      expect(desktopTitle).toEqual(title);
    });

    test('it renders toc when in mobile', async () => {
      const content = getMarkdownContent([
        '## H2 A',
        'Some text',
        '## H2 B',
        'Some more text',
        '### H3 a',
        'Some more text',
        '### H3 b',
        'Some more text',
        '### H4 a',
        'Some more text',
        '### H5 a',
        'Some more text',
        '## H2 C',
        'Some more text',
      ].join('\n'));
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `index.md`,
          content,
        },
      ]);

      const selectors = [
        '#toc-mobile',
        '#toc-desktop',
      ];

      // await printURL(1000)

      expect(await runner.page.evaluate((selectors) => selectors.map(selector =>
        !!window.document.querySelector(selector),
      ), selectors)).toEqual([true, true]);
      const desktopStyles = await runner.page.evaluate((selectors) => selectors.map(selector =>
        window.getComputedStyle(window.document.querySelector(selector)).display,
      ), selectors);
      expect(desktopStyles[0]).toEqual('none');
      expect(desktopStyles[1]).not.toEqual('none');
      runner.page.setViewportSize({ width: 600, height: 600 });
      const mobileStyles = await runner.page.evaluate((selectors) => selectors.map(selector =>
        window.getComputedStyle(window.document.querySelector(selector)).display,
      ), selectors);
      expect(mobileStyles[0]).not.toEqual('none');
      expect(mobileStyles[1]).toEqual('none');
    });

    test('it renders previous and next buttons', async () => {
      const files: DocoddityTestFile[] = [
        'index',
        'one',
        'two',
        'three',
      ].map((title, order) => ({
        filepath: `${title}.md`,
        content: getMarkdownContent(`Contents: ${title}`, {
          title,
          order,
        }).trim(),
      }));
      const { runner, printURL } = await configureDocodditySite(files, {
        // stdout: console.log,
      });
      // await printURL(1000)
      const selectors = {
        'prev': 'a[aria-role="prev"]',
        'next': 'a[aria-role="next"]',
      };

      const checkPage = async (title: string, buttons: [boolean, boolean]) => {
        const [fetchedHTML, fetchedTitle, ...fetchedSelectors] = await runner.page.evaluate(({ selectors }) => [
          window.document.querySelector('#content').innerHTML,
          window.document.title,
          ...selectors.map(selector =>
            !!window.document.querySelector(selector),
          )
        ], {
          selectors: Object.values(selectors),
        });

        try {
          expect(fetchedHTML.split('\n').map(l => l.trim()).filter(Boolean)).toEqual([`<h1>${title}</h1>`, `<p>Contents: ${title}</p>`]);
          expect(fetchedTitle).toEqual(title);
          expect(fetchedSelectors).toEqual(buttons);
        } catch (err) {
          throw new Error(`Error checking page ${title}: ${err.message}`);
        }
      }

      const { clickNext, clickPrev } = getActions(runner, selectors);

      await checkPage('index', [false, true]);
      await clickNext();

      await checkPage('one', [true, true]);
      await clickNext();
      await checkPage('two', [true, true]);
      await clickNext();
      await checkPage('three', [true, false]);
      await clickPrev();
    });

    test('it renders left and right in header', async () => {
      const content = getMarkdownContent('Contents');
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `foo.md`,
          content,
        },
        {
          filepath: 'docoddity.json',
          content: {
            title: 'Home',
            nav: {
              left: [
                {
                  url: '/page',
                  text: 'Page',
                },
                {
                  url: '/page2',
                  text: 'Page 2',
                },
                {
                  url: '/page3',
                  text: 'Page 3',
                },
                {
                  url: '/mobile-page',
                  text: 'Mobile',
                  mobile: true,
                },
              ],
              right: [
                {
                  url: '/right-one',
                  label: 'Righty One',
                  text: 'Right One',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  ariaLabel: 'Righty One',
                },
                {
                  url: '/right-two',
                  label: 'Righty Two',
                  text: 'Right Two',
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  ariaLabel: 'Righty Two',
                },

              ],
            }
          },
        },
      ]);

      await runner.goto('/foo');

      const selector = 'header[role="banner"].site-head.desktop a';
      const anchors = await runner.page.evaluate((selector) => Array.from(window.document.querySelectorAll(selector)).map(el => el.innerHTML.trim()), selector);
      expect(anchors).toEqual([
        'Home',
        'Page',
        'Page 2',
        'Page 3',
        'Mobile',
        'Right One',
        'Right Two',
      ]);
    })

    test('it renders left nav', async () => {
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `index.html`,
          content: '<p>Home page</p>',
        },
        {
          filepath: `docs/index.md`,
          content: getMarkdownContent('0', { title: 'Getting Started', order: 0 }),
        },
        {
          filepath: `docs/usage.md`,
          content: getMarkdownContent('1', { title: 'Usage', order: 1 }),
        },

        {
          filepath: `docs/no-page-title.md`,
          content: getMarkdownContent('2', { order: 2 }),
        },
      ]);

      await runner.goto('/docs/');

      const nav = await runner.page.evaluate(() => Array.from(window.document.querySelectorAll('nav#left-nav a')).map(el => el.outerHTML.trim()));
      expect(nav).toEqual([
        "<a href=\"/docs/index\">Getting Started</a>",
        "<a href=\"/docs/usage\">Usage</a>",
        "<a href=\"/docs/no-page-title\">No Page Title</a>",
      ]);
    });
  });
});

