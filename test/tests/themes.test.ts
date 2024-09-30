import * as url from 'url';
import {
  writeFile as _writeFile,
  readFile,
} from 'fs-extra';
import { setupBuild } from '../includes/setup-build.js';

import path from 'path';
import { TagDefinition } from '../setup/matchers/toContainTags.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';
import { getActions, getClick } from '../includes/getActions.js';
import { DocoddityTestFile } from '../includes/types.js';
import { getElementTransformStyle } from '../includes/get-element-transform-style.js';
import { setupDev } from '../includes/setup-dev.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

describe('Themes', () => {
  const configureDocodditySite = setupBuild({
    std: {
      stdout: chunk => console.log('[Docoddity]', chunk),
      stderr: chunk => console.error('[Docoddity]', chunk),
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

    test('it renders hamburger menu when in mobile', async () => {
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `index.md`,
          content: getMarkdownContent('Some more text'),
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
              ],
            }
          },
        },
      ]);

      runner.page.setViewportSize({ width: 600, height: 600 });
      const click = getClick(runner);
      await runner.page.evaluate(() => (window.document.querySelector('#hamburger-menu') as HTMLElement).style.transitionDuration = '0s');
      expect(await runner.page.evaluate(() => window.document.querySelector('#hamburger').getAttribute('aria-expanded'))).toEqual('false');
      expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(-600);
      await click('#hamburger');
      expect(await runner.page.evaluate(() => window.document.querySelector('#hamburger').getAttribute('aria-expanded'))).toEqual('true');
      expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(0);
      await click('#close-hamburger');
      expect(await runner.page.evaluate(() => window.document.querySelector('#hamburger').getAttribute('aria-expanded'))).toEqual('false');
      expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(-600);
      await click('#hamburger');
      expect(await runner.page.evaluate(() => window.document.querySelector('#hamburger').getAttribute('aria-expanded'))).toEqual('true');
      expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(0);
      await click('#hamburger-menu-overlay');
      expect(await runner.page.evaluate(() => window.document.querySelector('#hamburger').getAttribute('aria-expanded'))).toEqual('false');
      expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(-600);
    });

    test('it renders hamburger menu in mobile with a back to main menu button', async () => {
      const { runner, printURL } = await configureDocodditySite([
        {
          filepath: `index.md`,
          content: getMarkdownContent('Some more text'),
        },
        {
          filepath: `docs/index.md`,
          content: getMarkdownContent('Docs index', { order: 0 }),
        },
        {
          filepath: `docs/subfolder/index.md`,
          content: getMarkdownContent('Subfolder index', { title: 'One', order: 0 }),
        },
        {
          filepath: `docs/subfolder/two.md`,
          content: getMarkdownContent('Subfolder page two', { title: 'Two', order: 1 }),
        },
        {
          filepath: 'docoddity.json',
          content: {
            title: 'Home',
            nav: {
              "left": [
                { text: 'Zero', url: '/zero' },
                { text: 'One', url: '/one' },
                { text: 'Two', url: '/data/foo/two' },
              ]
            },
          },
        }
      ]);

      await runner.goto('/docs/subfolder/');
      runner.page.setViewportSize({ width: 600, height: 600 });
      const click = getClick(runner);
      await runner.page.evaluate(() => (window.document.querySelector('#hamburger-menu') as HTMLElement).style.transitionDuration = '0s');
      await runner.page.evaluate(() => (window.document.querySelector('#hamburger-contents main') as HTMLElement).style.transitionDuration = '0s');
      expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(-600);
      await click('#hamburger');
      expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(0);
      await expect(runner.page).toMatchQuerySelectorAll('#hamburger-contents main section:first-child a', [
        '<a href="/docs/subfolder/" class="active">One</a>',
        '<a href="/docs/subfolder/two">Two</a>',
      ]);
      await expect(runner.page).toMatchQuerySelectorAll('#hamburger-contents main section:last-child a', [
        '<a href="/zero">Zero</a>',
        '<a href="/one">One</a>',
        '<a href="/data/foo/two">Two</a>',
      ]);

      expect((await getElementTransformStyle(runner, '#hamburger-contents main')).x).toEqual(0);
      await click('#back-to-main-menu');
      expect((await getElementTransformStyle(runner, '#hamburger-contents main')).x).toEqual(498);
    });
  });

  describe('Config', () => {
    test('it should crash if provided a badly formatted docoddity in build mode', async () => {
      const content = 'foobar';
      await expect(async () => await configureDocodditySite([
        {
          filepath: `index.html`,
          content: `
              <p>${content}</p>
    `,
        },
        {
          filepath: 'docoddity.json',
          content: '{',
        }
      ])).rejects.toThrow();
    });

    test('it should not crash if provided a badly formatted docoddity in dev mode', async () => {
      const configureDevDocodditySite = setupDev({
        std: {
          stdout: chunk => console.log('[Docoddity]', chunk),
          stderr: chunk => console.error('[Docoddity]', chunk),
        }
      });
      const content = 'foobar';
      const { waitForDocoddityFileToBeWritten, runner, printURL, updateFiles } = await configureDevDocodditySite([
        {
          filepath: `index.html`,
          content: `
        <p>${content}</p>
      `,
        },
        {
          filepath: 'docoddity.json',
          content: '{',
        }
      ]);

      expect(await runner.page.evaluate(() => window.document.body.innerText)).toEqual('');
      await updateFiles([{
        filepath: 'docoddity.json',
        content: '{}',
      }]);
      await waitForDocoddityFileToBeWritten('index.html');
      await runner.goto('/')
      expect(await runner.page.evaluate(() => window.document.querySelector('body p')?.innerText)).toEqual(content);

    });

    test('it should not render algolia if omitted', async () => {
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
            config: {
            },
          },
        }
      ]);
      expect(await runner.page.evaluate(() => !!window.document.querySelector('#docsearch'))).toBe(false);
    });

    test('it should render algolia if included', async () => {
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
            config: {
              algolia: {
                appId: '123',
                indexName: 'some-index-name',
                apiKey: '123',
              },
            },
          },
        }
      ]);
      expect(await runner.page.evaluate(() => !!window.document.querySelector('#docsearch'))).toBe(true);
    });

  });

  describe('Left nav', () => {
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
          filepath: `docs/section-one/.category.json`,
          content: {
            order: 1,
            title: 'Section One',
          },
        },
        {
          filepath: `docs/section-one/index.md`,
          content: getMarkdownContent('section one index', { title: 'Section One Index', order: 0 }),
        },
        {
          filepath: `docs/section-one/page-two.md`,
          content: getMarkdownContent('section one page two', { title: 'Section One Page Two', order: 1 }),
        },
        {
          filepath: `docs/section-one/page-three.md`,
          content: getMarkdownContent('section one page three', { title: 'Section One Page Three', order: 2 }),
        },
        {
          filepath: `docs/page-two.md`,
          content: getMarkdownContent('2', { title: 'Page Two', order: 2 }),
        },
        {
          filepath: `docs/section-three/.category.json`,
          content: {
            order: 3,
            title: 'Section Three',
          },
        },
        {
          filepath: `docs/section-three/index.md`,
          content: getMarkdownContent('section three index', { title: 'Section Three Index', order: 0 }),
        },
        {
          filepath: `docs/section-three/page-two.md`,
          content: getMarkdownContent('section three page two', { title: 'Section Three Page Two', order: 1 }),
        },
        {
          filepath: `docs/section-three/nested/.category.json`,
          content: {
            order: 4,
            title: 'Nested',
          },
        },
        {
          filepath: `docs/section-three/nested/index.md`,
          content: getMarkdownContent('section three nested page index', { title: 'Nested Index', order: 0 }),
        },
        {
          filepath: `docs/section-three/nested/page-one.md`,
          content: getMarkdownContent('section three nested page one', { title: 'Nested Page One', order: 1 }),
        },
        {
          filepath: `docs/section-three/page-three.md`,
          content: getMarkdownContent('section three page three', { title: 'Section Three Page Three', order: 2 }),
        },
        {
          filepath: `docs/page-five.md`,
          content: getMarkdownContent('5', { title: 'Page Five', order: 5 }),
        },
        {
          filepath: `api/index.md`,
          content: getMarkdownContent('api', { title: 'API', order: 0 }),
        },
        {
          filepath: `api/page-two.md`,
          content: getMarkdownContent('page two', { title: 'Page Two', order: 1 }),
        },
      ]);


      await runner.goto('/api');

      await expect(runner).toMatchPage({
        leftNav: [
          { href: '/api/', text: 'API', class: 'active' },
          { href: '/api/page-two', text: 'Page Two' },
        ]
      });

      await runner.goto('/docs');

      await expect(runner).toMatchPage({
        leftNav: [
          { href: '/docs/', text: 'Getting Started', class: 'active' },
          { href: '/docs/section-one', text: 'Section One', },
          { href: '/docs/section-one/', text: 'Section One Index', },
          { href: '/docs/section-one/page-two', text: 'Section One Page Two', },
          { href: '/docs/section-one/page-three', text: 'Section One Page Three', },
          { href: '/docs/page-two', text: 'Page Two', },
          { href: '/docs/section-three', text: 'Section Three', },
          { href: '/docs/section-three/', text: 'Section Three Index', },
          { href: '/docs/section-three/page-two', text: 'Section Three Page Two', },
          { href: '/docs/section-three/page-three', text: 'Section Three Page Three', },
          { href: '/docs/section-three/nested', text: 'Nested', },
          { href: '/docs/section-three/nested/', text: 'Nested Index', },
          { href: '/docs/section-three/nested/page-one', text: 'Nested Page One', },
          { href: '/docs/page-five', text: 'Page Five', },
        ]
      });
    });

    test.only('it toggles left nav rows', async () => {
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
          filepath: `docs/section-one/.category.json`,
          content: {
            order: 1,
            title: 'Section One',
          },
        },
        {
          filepath: `docs/section-one/index.md`,
          content: getMarkdownContent('section one index', { title: 'Section One Index', order: 0 }),
        },
        {
          filepath: `docs/section-one/page-two.md`,
          content: getMarkdownContent('section one page two', { title: 'Section One Page Two', order: 1 }),
        },
        {
          filepath: `docs/section-one/page-three.md`,
          content: getMarkdownContent('section one page three', { title: 'Section One Page Three', order: 2 }),
        },
        {
          filepath: `docs/page-two.md`,
          content: getMarkdownContent('2', { title: 'Page Two', order: 2 }),
        },
        {
          filepath: `docs/section-three/.category.json`,
          content: {
            order: 3,
            title: 'Section Three',
          },
        },
        {
          filepath: `docs/section-three/index.md`,
          content: getMarkdownContent('section three index', { title: 'Section Three Index', order: 0 }),
        },
        {
          filepath: `docs/section-three/page-two.md`,
          content: getMarkdownContent('section three page two', { title: 'Section Three Page Two', order: 1 }),
        },
        {
          filepath: `docs/section-three/nested/.category.json`,
          content: {
            order: 4,
            title: 'Nested',
          },
        },
        {
          filepath: `docs/section-three/nested/index.md`,
          content: getMarkdownContent('section three nested page index', { title: 'Nested Index', order: 0 }),
        },
        {
          filepath: `docs/section-three/nested/page-one.md`,
          content: getMarkdownContent('section three nested page one', { title: 'Nested Page One', order: 1 }),
        },
        {
          filepath: `docs/section-three/page-three.md`,
          content: getMarkdownContent('section three page three', { title: 'Section Three Page Three', order: 2 }),
        },
        {
          filepath: `docs/page-five.md`,
          content: getMarkdownContent('5', { title: 'Page Five', order: 5 }),
        },
      ]);
      await runner.goto('/docs');

      const nonExpanded = '36px';

      await runner.page.evaluate(() => Array.from(window.document.querySelectorAll('#left-nav li')).map(li => (li as HTMLElement).style.transitionDuration = '0s'));
      await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4)')))).gridTemplateRows).toEqual(nonExpanded);
      await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4) li:nth-child(4)')))).gridTemplateRows).toEqual(nonExpanded);
      await runner.page.evaluate(() => (window.document.querySelector('#left-nav li:nth-child(4) button') as HTMLElement).click());
      await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4)')))).gridTemplateRows).toEqual('196px');
      await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4) li:nth-child(4)')))).gridTemplateRows).toEqual(nonExpanded);
      await runner.page.evaluate(() => (window.document.querySelector('#left-nav li:nth-child(4) li:nth-child(4) button') as HTMLElement).click());
      await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4)')))).gridTemplateRows).toEqual('276px');
      await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4) li:nth-child(4)')))).gridTemplateRows).toEqual('116px');
    });
  });
});
