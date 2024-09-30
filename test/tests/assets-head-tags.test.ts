import { setupBuild } from '../includes/setup-build.js';
import { toSelector } from '../includes/to-selector.js';

describe('Head Tags', () => {
  const configureDocodditySite = setupBuild({
    std: {
      // stdout: chunk => console.log('[Docoddity]', chunk),
      // stderr: chunk => console.error('[Docoddity]', chunk),
    }
  });

  const content =
  {
    filepath: `index.html`,
    content: `
              <p>foobar</p>
    `,
  };
  test('it can populate head tags', async () => {
    const headTags = [
      {
        tag: 'link',
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        tag: 'link',
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
      },
      {
        tag: 'link',
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Work+Sans:ital,wght@0,100..900;1,100..900&Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=League+Spartan:wght@100..900&display=swap",
      },
    ];
    const { runner, printURL } = await configureDocodditySite([
      content,
      {
        filepath: 'docoddity.json',
        content: {
          head: headTags,
        },
      },
    ]);
    // await printURL(1000);
    await expect(runner.page).toContainTags(headTags.map(({ href, rel }) => {
      return toSelector({
        tag: 'link',
        href,
        rel,
      });
    }));
  });

  test('it can populate head tags with full content', async () => {
    const headTags = [
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Work+Sans:ital,wght@0,100..900;1,100..900&Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&family=League+Spartan:wght@100..900&display=swap",
      },
    ];
    const { runner, printURL } = await configureDocodditySite([
      content,
      {
        filepath: 'docoddity.json',
        content: {
          head: headTags.map(({ rel, href }) => {
            return `<link rel="${rel}" href="${href}">`;
          }),
        },
      },
    ]);
    await expect(runner.page).toContainTags(headTags.map(({ href, rel }) => toSelector({
      tag: 'link',
      href,
      rel,
    })));
  });

  describe('Content', () => {
    test('it can populate head tags with a path to a file', async () => {
      const headTags = [
        {
          "tag": "script",
          "foo": "bar",
          "content": {
            "filename": "./script-content.js"
          }
        }
      ];
      const scriptContent = 'console.log("hello world");';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './script-content.js',
          content: scriptContent,
        },
        {
          filepath: 'docoddity.json',
          content: {
            head: headTags,
          },
        },

      ]);
      expect(await runner.page.evaluate(() => { return window.document.querySelector(`script[foo="bar"]`)?.innerHTML; })).toEqual(scriptContent);
    });

    test('it can populate head with inline content', async () => {
      const innerContent = JSON.stringify({
        "imports": {
          "@xenova/transformers": "https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js",
          "@vanillawc/wc-codemirror": "https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror/index.js",
          "@vanillawc/": "https://cdn.jsdelivr.net/npm/@vanillawc/",
          "@lit/reactive-element": "https://cdn.jsdelivr.net/npm/@lit/reactive-element/reactive-element.js",
          "@lit/": "https://cdn.jsdelivr.net/npm/@lit/",
          "lit-element": "https://cdn.jsdelivr.net/npm/lit-element/index.js",
          "lit-element/lit-element.js": "https://cdn.jsdelivr.net/npm/lit-element/lit-element.js",
          "lit-html": "https://cdn.jsdelivr.net/npm/lit-html/lit-html.js",
          "lit-html/": "https://cdn.jsdelivr.net/npm/lit-html/",
          "lit": "https://cdn.jsdelivr.net/npm/lit/index.js",
          "lit/": "https://cdn.jsdelivr.net/npm/lit/",
          "@shoelace-style/": "https://cdn.jsdelivr.net/npm/@shoelace-style/",
          "@docsearch/js": "https://cdn.jsdelivr.net/npm/@docsearch/js/dist/esm/index.js",
          "@alenaksu/json-viewer": "https://cdn.jsdelivr.net/npm/@alenaksu/json-viewer/dist/json-viewer.js"
        }
      });
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: 'docoddity.json',
          content: {
            head: [{
              tag: 'script',
              type: 'importmap2',
              content: innerContent,
            }],
          },
        },
      ]);
      expect(await runner.page.evaluate(() => { return window.document.querySelector(`script[type="importmap2"]`)?.innerHTML; })).toEqual(innerContent);
    });

  });
});
