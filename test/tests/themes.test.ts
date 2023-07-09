// test/my-library-test.js

import * as url from 'url';
import {
  writeFile as _writeFile,
  readFile,
} from 'fs-extra';
import { setup } from '../includes/setup.js';

import path from 'path';
import { TagDefinition } from '../setup/matchers/toContainTags.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';
import { getActions } from '../includes/getActions.js';
import type { DocoddityFile } from '../includes/types.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

describe('Themes', () => {
  const configureDocodditySite = setup();

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
        `link[href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace/dist/themes/light.css"]`,
        `link[href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace/dist/themes/dark.css"]`,
        { url: `script[type="module"][defer="true"]`, contents: shoelaceConfig.trim() },
        { url: `script[type="importmap"]`, contents: importMap.trim() },
        ...[
          'reset.css',
          'github-markdown.css',
          'variables.css',
          'style.css',
        ].map(style => `link[orig-src="./styles/${style}"][data-file="theme"]`),
        `script[async=false][defer=false][type="module"][orig-src="./scripts/index.ts"][data-file="theme"]`,
      ];
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
      const files: DocoddityFile[] = [
        'index',
        'one',
        'two',
        'three',
      ].map((title, order) => ({
        filepath: `${title}.md`,
        content: getMarkdownContent(`Contents: ${title}`, {
          title,
          eleventyNavigation: {
            parent: 'docs',
            key: title,
            order,
          },
        }).trim(),
      }));
      const { runner, printURL } = await configureDocodditySite(files, {
        stdout: console.log,
      });
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

        expect(fetchedHTML.split('\n').map(l => l.trim()).filter(Boolean)).toEqual([`<h1>${title}</h1>`, `<p>Contents: ${title}</p>`]);
        expect(fetchedTitle).toEqual(title);
        expect(fetchedSelectors).toEqual(buttons);
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

    test('it renders left, center, and right in header', async () => {
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
                  url: '/foo',
                  text: 'Foo',
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
                },
                {
                  url: '/right-two',
                  label: 'Righty Two',
                  text: 'Right Two',
                },

              ],
            }
          },
        },
      ]);

      await runner.goto('/foo');

      expect((await runner.page.evaluate((selectors) => selectors.map(selector =>
        window.document.querySelector(selector)?.innerHTML,
      ), [
        'header[role="banner"].site-head.desktop a[href="/"]',
        'header[role="banner"].site-head.desktop a[href="/page"]',
        'header[role="banner"].site-head.desktop a[href="/foo"].active',
        'header[role="banner"].site-head.desktop a[href="/mobile-page"].mobile',
        'header[role="banner"].site-head.desktop a[href="/right-one"][target="_blank"][rel="noopener noreferrer"][aria-label="Righty One"]',
        'header[role="banner"].site-head.desktop a[href="/right-two"][target="_blank"][rel="noopener noreferrer"][aria-label="Righty Two"]',
      ])).map(result => {
        return (result || '').split('<svg').shift().trim();
      })).toEqual([
        'Home',
        'Page',
        'Foo',
        'Mobile',
        'Right One',
        'Right Two',
      ]);
    })
  });
});

