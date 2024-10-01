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
      // stdout: chunk => console.log('[Docoddity]', chunk),
      // stderr: chunk => console.error('[Docoddity]', chunk),
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

    describe('Top page nav', () => {
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

      test('it renders boths sides of top page header', async () => {
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

    })

    describe('TOC', () => {
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
            content: getMarkdownContent('This is the index page'),
          },
          {
            filepath: `docs/index.md`,
            content: getMarkdownContent('Docs index', { title: 'One', order: 0 }),
          },
          {
            filepath: `docs/two.md`,
            content: getMarkdownContent('Docs page two', { title: 'Two', order: 1 }),
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

        await runner.goto('/docs/');
        // await printURL();
        runner.page.setViewportSize({ width: 600, height: 600 });
        const click = getClick(runner);
        await runner.page.evaluate(() => (window.document.querySelector('#hamburger-menu') as HTMLElement).style.transitionDuration = '0s');
        await runner.page.evaluate(() => (window.document.querySelector('#hamburger-contents main') as HTMLElement).style.transitionDuration = '0s');
        expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(-600);
        await click('#hamburger');
        expect((await getElementTransformStyle(runner, '#hamburger-menu')).x).toEqual(0);
        await expect(runner.page).toMatchQuerySelectorAll('#hamburger-contents main section:first-child a', [
          '<a href="/docs/" class="label active">One</a>',
          '<a href="/docs/two" class="label">Two</a>',
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

      test('it renders active links on toc on desktop', async () => {
        const getParagraph = (nums: number[]) => nums.map(num => Array(num).fill('').map((_, i) => i).join(' ')).reduce((acc, num) => acc.length === 0 ? acc.concat(num) : acc.concat('', '', num), []);
        const content = getMarkdownContent([
          '## First one',
          ...getParagraph([50, 50]),
          '## Second one',
          ...getParagraph([50, 120, 30]),
          '### Nested one',
          ...getParagraph([40, 150, 80]),
          '### Nested two',
          ...getParagraph([50, 120, 30, 120]),
          '## Third one',
          ...getParagraph([50, 40, 130, 120, 50]),
        ].join('\n'));
        const { runner, printURL } = await configureDocodditySite([
          {
            filepath: `index.md`,
            content,
          },
        ]);

        await expect(runner.page.evaluate(() => window.document.querySelector('#toc-desktop a.active')?.innerHTML)).resolves.toEqual('First one');
        // await printURL(1000)
        // await runner.page.mouse.wheel(0, 2000);
        // // await runner.page.locator('h2[id="second-one"]').scrollIntoViewIfNeeded();
        // await expect(runner.page.evaluate(() => window.document.querySelector('#toc-desktop a.active')?.innerHTML)).resolves.toEqual('Second one');
        // // await runner.page.scrollTo(0, 500);
        // // await expect(runner.page.evaluate(() => window.document.querySelector('#toc-desktop a.active')?.innerHTML)).resolves.toEqual('Nested one');
        // // await runner.page.scrollTo(0, 1200);
        // // await expect(runner.page.evaluate(() => window.document.querySelector('#toc-desktop a.active')?.innerHTML)).resolves.toEqual('Nested two');
        // // await runner.page.scrollTo(0, 1800);
        // // await expect(runner.page.evaluate(() => window.document.querySelector('#toc-desktop a.active')?.innerHTML)).resolves.toEqual('Third one');
      });
    })

    describe('Pagination', () => {
      test('it renders previous and next buttons', async () => {
        const files: DocoddityTestFile[] = [
          'docs/index',
          'docs/one',
          'docs/two',
          'docs/three',
        ].map((title, order) => ({
          filepath: `${title}.md`,
          content: getMarkdownContent(`Contents: ${title}`, {
            title: title.split('/').pop(),
            order,
          }).trim(),
        }));
        const { runner, printURL } = await configureDocodditySite(files, {
          // stdout: console.log,
        });
        await runner.goto('/docs');
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

        // await printURL();
        await expect(runner).toMatchPage({
          pageTitle: 'index',
          prevHTML: '',
          nextHTML: 'one',
        });
        await clickNext();

        await expect(runner).toMatchPage({
          pageTitle: 'one',
          prevHTML: 'index',
          nextHTML: 'two',
        });
        await clickNext();
        await expect(runner).toMatchPage({
          pageTitle: 'two',
          prevHTML: 'one',
          nextHTML: 'three',
        });
        await clickNext();
        await expect(runner).toMatchPage({
          pageTitle: 'three',
          prevHTML: 'two',
          nextHTML: '',
        });
        // await clickPrev();
      });
    })

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
            { href: null, text: 'Section One', },
            { href: '/docs/section-one/', text: 'Section One Index', },
            { href: '/docs/section-one/page-two', text: 'Section One Page Two', },
            { href: '/docs/section-one/page-three', text: 'Section One Page Three', },
            { href: '/docs/page-two', text: 'Page Two', },
            { href: null, text: 'Section Three', },
            { href: '/docs/section-three/', text: 'Section Three Index', },
            { href: '/docs/section-three/page-two', text: 'Section Three Page Two', },
            { href: '/docs/section-three/page-three', text: 'Section Three Page Three', },
            { href: null, text: 'Nested', },
            { href: '/docs/section-three/nested/', text: 'Nested Index', },
            { href: '/docs/section-three/nested/page-one', text: 'Nested Page One', },
            { href: '/docs/page-five', text: 'Page Five', },
          ]
        });
      });

      test('it renders left nav starting at the section root', async () => {
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
            filepath: `docs/section-one/section-two/.category.json`,
            content: {
              title: 'Section Two',
              order: 1,
            },
          },
          {
            filepath: `docs/section-one/section-two/page-a.md`,
            content: getMarkdownContent('page-a', { title: 'Page A', order: 0 }),
          },
          {
            filepath: `docs/section-one/section-two/section-three/.category.json`,
            content: {
              title: 'Section Three',
              order: 1,
            },
          },
          {
            filepath: `docs/section-one/section-two/section-three/page-b.md`,
            content: getMarkdownContent('page-b', { title: 'Page B', order: 0 }),
          },
          {
            filepath: `docs/section-one/section-two/section-three/page-c.md`,
            content: getMarkdownContent('page-c', { title: 'Page C', order: 1 }),
          },
          {
            filepath: `docs/section-one/page-three.md`,
            content: getMarkdownContent('section one page three', { title: 'Section One Page Three', order: 2 }),
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

        await runner.goto('/docs/section-one/section-two/section-three/page-c');
        // await printURL()
        const getGridTemplateRows = async (selector: string) => await runner.page.evaluate((selector) => window.getComputedStyle(window.document.querySelector(selector)).gridTemplateRows, selector);

        await expect(await getGridTemplateRows('#left-nav li:nth-child(2)')).toEqual('316px');
        await expect(await getGridTemplateRows('#left-nav li:nth-child(2) li:nth-child(2)')).toEqual('196px');
        await expect(await getGridTemplateRows('#left-nav li:nth-child(2) li:nth-child(2) li:nth-child(2')).toEqual('116px');
        await expect(runner).toMatchPage({
          leftNav: [
            { href: '/docs/', text: 'Getting Started' },
            { href: null, text: 'Section One', },
            { href: '/docs/section-one/', text: 'Section One Index', },
            { href: null, text: 'Section Two', },
            { href: '/docs/section-one/section-two/page-a', text: 'Page A', },
            { href: null, text: 'Section Three', },
            { href: '/docs/section-one/section-two/section-three/page-b', text: 'Page B', },
            { href: '/docs/section-one/section-two/section-three/page-c', text: 'Page C', class: 'active' },
            { href: '/docs/section-one/page-three', text: 'Section One Page Three', },
          ]
        });
      });

      test('it toggles left nav rows', async () => {
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

      test('it renders left nav and comes up with title if missing one', async () => {
        const { runner, printURL } = await configureDocodditySite([
          {
            filepath: `docs/index.md`,
            content: getMarkdownContent('Docs index', { order: 0 }),
          },
        ]);

        await runner.goto('/docs/');
        await expect(runner).toMatchPage({
          leftNav: [
            { href: '/docs/', text: 'Docs' },
          ]
        });
      });

      test('it should not show an anchor link for a missing page', async () => {
        const { runner, printURL } = await configureDocodditySite([
          {
            filepath: `index.html`,
            content: '<p>Home page</p>',
          },
          {
            filepath: `root/foo/bar/baz/page-two.md`,
            content: getMarkdownContent('section one page two', { title: 'Section One Page Two', order: 1 }),
          },
          {
            filepath: `root/foo/bar/baz/page-three.md`,
            content: getMarkdownContent('section one page three', { title: 'Section One Page Three', order: 2 }),
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
        await runner.goto('/root/foo/bar/baz/page-two');

        // await printURL();
        await expect(runner).toMatchPage({
          leftNav: [
            { tagName: 'label', href: null, text: 'Foo', },
            { tagName: 'label', href: null, text: 'Bar', },
            { tagName: 'label', href: null, text: 'Baz', },
            { tagName: 'a', href: '/root/foo/bar/baz/page-two', text: 'Section One Page Two', class: ['active', 'label'] },
            { tagName: 'a', href: '/root/foo/bar/baz/page-three', text: 'Section One Page Three', },
          ]
        });
      });

      describe('.category.json', () => {

        test('it shows nested rows that lack a .category.json', async () => {
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
              filepath: `api/index.md`,
              content: getMarkdownContent('api', { title: 'API', order: 0 }),
            },
            {
              filepath: `api/page-two.md`,
              content: getMarkdownContent('page two', { title: 'Page Two', order: 1 }),
            },
          ]);
          await runner.goto('/docs');

          // await printURL();
          await expect(runner).toMatchPage({
            leftNav: [
              { href: '/docs/', text: 'Getting Started', class: 'active' },
              { href: null, text: 'Section One', },
              { href: '/docs/section-one/', text: 'Section One Index', },
              { href: '/docs/section-one/page-two', text: 'Section One Page Two', },
              { href: '/docs/section-one/page-three', text: 'Section One Page Three', },
            ]
          });
        });

        test('it shows nested rows that have a .category.json without a title', async () => {
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
              filepath: `api/index.md`,
              content: getMarkdownContent('api', { title: 'API', order: 0 }),
            },
            {
              filepath: `api/page-two.md`,
              content: getMarkdownContent('page two', { title: 'Page Two', order: 1 }),
            },
          ]);
          await runner.goto('/docs');

          // await printURL();
          await expect(runner).toMatchPage({
            leftNav: [
              { href: '/docs/', text: 'Getting Started', class: 'active' },
              { href: null, text: 'Section One', },
              { href: '/docs/section-one/', text: 'Section One Index', },
              { href: '/docs/section-one/page-two', text: 'Section One Page Two', },
              { href: '/docs/section-one/page-three', text: 'Section One Page Three', },
            ]
          });
        });

        test('it defaults to open if specified', async () => {
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
                open: true,
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
                open: true,
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
          await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(2)')))).gridTemplateRows).toEqual('156px');
          await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4)')))).gridTemplateRows).toEqual(nonExpanded);
          await runner.page.evaluate(() => (window.document.querySelector('#left-nav li:nth-child(4) button') as HTMLElement).click());
          await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4)')))).gridTemplateRows).toEqual('276px');
          await expect((await runner.page.evaluate(() => window.getComputedStyle(window.document.querySelector('#left-nav li:nth-child(4) li:nth-child(4)')))).gridTemplateRows).toEqual('116px');
        });
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

  });
});
