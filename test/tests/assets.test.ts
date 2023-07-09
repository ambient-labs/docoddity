import { setup } from '../includes/setup.js';
import { TagDefinition } from '../setup/matchers/toContainTags.js';

const toSelector = (obj: Record<string, unknown>, tagName = '*', mapping: Record<string, string> = { src: 'orig-src', href: 'orig-src' }) => {
  const selectorAttbs = Object.entries(obj).map(([key, value]) => {
    if (key in mapping) {
      return `[${mapping[key]}="${value}"]`;
    }
    return `[${key}="${value}"]`;
  }).join('');
  return `${tagName}${selectorAttbs}`;
}

describe('Assets', () => {
  const configureDocodditySite = setup();

  const content =
  {
    filepath: `index.html`,
    content: `
              <p>foobar</p>
    `,
  };
  describe('Javascript Assets', () => {
    test('it should render a single local javascript asset', async () => {
      const fnResponse = 'foobarbaz1';
      const { runner } = await configureDocodditySite([
        content,
        {
          filepath: './scripts/foo.js',
          content: `window.foo = () => "${fnResponse}";`,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              './scripts/foo.js',
            ],
          },
        },
      ]);
      // await printURL();
      expect(await runner.page.evaluate(() => { return window['foo'](); })).toEqual(fnResponse);
    });

    test('it should render a javascript asset with properties', async () => {
      const fnResponse = 'foobarbaz2';
      const script = {
        src: './scripts/foo.js',
        async: false,
        type: 'module',
        defer: true,
        'data-domain': 'foo.bar',
      }
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './scripts/foo.js',
          content: `window.foo = () => "${fnResponse}";`,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              script,
            ],
          },
        },
      ]);
      await expect(runner.page).toContainTags([
        toSelector(script, 'script'),
      ]);
    });

    test('it should render multiple local javascript assets', async () => {
      const fooResponse = 'foo';
      const barResponse = 'bar';
      const bazResponse = 'baz';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './scripts/foo.js',
          content: `window.foo = () => "${fooResponse}";`,
        },
        {
          filepath: './scripts/bar.js',
          content: `window.bar = () => "${barResponse}";`,
        },
        {
          filepath: './scripts/baz.js',
          content: `window.baz = () => "${bazResponse}";`,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              './scripts/foo.js',
              './scripts/bar.js',
              './scripts/baz.js',
            ],
          },
        },
      ]);
      expect(await runner.page.evaluate(() => { return window['foo']() + window['bar']() + window['baz'](); })).toEqual(fooResponse + barResponse + bazResponse);
    });

    test('it should render an external JS asset', async () => {
      const script = 'https://cdn.jsdelivr.net/npm/@docsearch/js@3';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              script,
            ],
          },
        },
      ]);
      // await printURL();
      expect(await runner.page.evaluate((script) => { return !!window.document.querySelector(`script[src="${script}"]`); }, script)).toEqual(true);
    });

    test('it should render both local and external JS assets', async () => {
      const fnResponse = 'foobarbaz3';
      const script = 'https://cdn.jsdelivr.net/npm/@docsearch/js@3';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './scripts/foo.js',
          content: `window.foo = () => "${fnResponse}";`,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              script,
              './scripts/foo.js',
            ],
          },
        },
      ]);
      // await printURL();
      expect(await runner.page.evaluate(() => { return window['foo'](); })).toEqual(fnResponse);
      expect(await runner.page.evaluate((script) => { return !!window.document.querySelector(`script[src="${script}"]`); }, script)).toEqual(true);
    });
  });

  describe('Typescript Assets', () => {
    test('it should render a single local typescript asset without a tsconfig.json present', async () => {
      const fnResponse = 'foobarbaz4';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './scripts/foo.ts',
          content: `(window as any).foo = (input: string) => "${fnResponse}" + input;`,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              './scripts/foo.ts',
            ],
          },
        },
      ]);
      // await printURL(1);
      expect(await runner.page.evaluate((fnResponse) => { return window['foo'](fnResponse); }, fnResponse)).toEqual(fnResponse + fnResponse);
    });

    test('it should render a single local typescript asset with a tsconfig.json present', async () => {
      const filepath = './scripts/with-tsconfig.ts';
      const tsContent = `
class Greeter {
  @format("Hello, %s")
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }
  greet() {
    let formatString = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
import "reflect-metadata";
const formatMetadataKey = Symbol("format");
function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}
function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
(window as any).foo = () => 'foobar1';
      `;
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: 'tsconfig.json',
          content: {
            compilerOptions: {
              "experimentalDecorators": true,
            }
          },
        },
        {
          filepath,
          content: tsContent,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              filepath,
            ],
          },
        },
      ]);
      // await printURL(1);
      expect(await runner.page.evaluate(() => { return window['foo'](); })).toEqual('foobar1');
    });

    test('it ignores outDir and files in tsconfig', async () => {
      const filepath = './scripts/with-tsconfig.ts';
      const fnResponse = 'fn';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: 'tsconfig.json',
          content: {
            compilerOptions: {
              outDir: './foobar',
            },
            files: [
              'bar.ts',
            ]
          },
        },
        {
          filepath: './scripts/foo.ts',
          content: `(window as any).foo = (input: string) => "${fnResponse}" + input;`,
        },
        {
          filepath: 'docoddity.json',
          content: {

            scripts: [
              './scripts/foo.ts',
            ],
          },
        }
      ]);
      // await printURL();
      expect(await runner.page.evaluate((fnResponse) => { return window['foo'](fnResponse); }, fnResponse)).toEqual(fnResponse + fnResponse);
    });

    test('it should work with imports', async () => {
      const fnResponse = 'foobarbaz5';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './scripts/bar.ts',
          content: `
export function bar() {
  return 'bar';
}
`,
        },
        {
          filepath: './scripts/foo.ts',
          content: `
import { bar } from './bar.js';
function foo() {
  return bar();
}
(window as any).foo = foo;`,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              './scripts/foo.ts',
            ],
          },
        },
      ]);
      // await printURL();
      expect(await runner.page.evaluate((fnResponse) => { return window['foo'](fnResponse); }, fnResponse)).toEqual('bar');
    });

    test('it should work with multiple TS files and JS files', async () => {
      const fnResponse = 'foobarbaz6';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './scripts/qux.js',
          content: `window.qux = () => 'qux';`,
        },
        {
          filepath: './scripts/baz.ts',
          content: `
function baz() {
  return 'baz';
}
(window as any).baz = baz;
`,
        },
        {
          filepath: './scripts/bar.ts',
          content: `
export function bar() {
  return 'bar';
}
`,
        },
        {
          filepath: './scripts/foo.ts',
          content: `
import { bar } from './bar.js';
function foo() {
  return bar();
}
(window as any).foo = foo;`,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              './scripts/foo.ts',
              './scripts/baz.ts',
              './scripts/qux.js',
            ],
          },
        },
      ]);
      // await printURL();
      expect(await runner.page.evaluate((fnResponse) => {
        return window['foo']() + window['baz']() + window['qux']();
      }, fnResponse)).toEqual('barbazqux');
    });

    test('it should render a typescript asset with properties', async () => {
      const fnResponse = 'foobarbaz7';
      const script = {
        src: './scripts/foo.ts',
        async: false,
        type: 'module',
        defer: true,
        'data-domain': 'foo.bar',
      }
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: script.src,
          content: `(window as any).foo = () => "${fnResponse}";`,
        },
        {
          filepath: 'docoddity.json',
          content: {
            scripts: [
              script,
            ],
          },
        },
      ]);
      await expect(runner.page).toContainTags([
        toSelector(script, 'script'),
      ]);
    });
  });

  describe('CSS Assets', () => {
    test('it should render a single local CSS asset', async () => {
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './styles/style.css',
          content: `body { background: red; } `,
        },
        {
          filepath: 'docoddity.json',
          content: {
            styles: [
              './styles/style.css',
            ],
          },
        }
      ]);
      // await printURL();
      const bg = await runner.page.evaluate(() => {
        return window.getComputedStyle(window.document.body).background;
      });
      expect(bg).toEqual('rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');
    });

    test('it should render multiple local CSS assets in order', async () => {
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './styles/foo.css',
          content: `body { background: red; } `,
        },
        {
          filepath: './styles/bar.css',
          content: `body { background: green; } `,
        },
        {
          filepath: 'docoddity.json',
          content: {
            styles: [
              './styles/bar.css',
              './styles/foo.css',
            ],
          },
        }
      ]);
      // await printURL();
      expect(await runner.page.evaluate(() => {
        return window.getComputedStyle(window.document.body).background;
      })).toEqual('rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');
    });

    test('it should render a CSS asset with properties', async () => {
      const style = {
        href: './styles/style.css',
        media: "screen and (max-width: 600px)",
      };
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: style.href,
          content: `body { background: red; } `,
        },
        {
          filepath: 'docoddity.json',
          content: {
            styles: [
              style,
            ],
          },
        },
      ]);
      await expect(runner.page).toContainTags([
        toSelector(style, 'link'),
      ]);
    });

    test('it should render an external CSS asset', async () => {
      const href = 'https://raw.githubusercontent.com/elad2412/the-new-css-reset/main/css/reset.css';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: 'docoddity.json',
          content: {
            styles: [
              href,
            ],
          }
        },
      ]);
      expect(await runner.page.evaluate((href) => { return !!window.document.querySelector(`link[orig-src="${href}"]`); }, href)).toEqual(true);
    });

    test('it should render both local and external JS assets', async () => {
      const href = 'https://raw.githubusercontent.com/elad2412/the-new-css-reset/main/css/reset.css';
      const { runner, printURL } = await configureDocodditySite([
        content,
        {
          filepath: './styles/style.css',
          content: `body { background: red; } `,
        },
        {
          filepath: 'docoddity.json',
          content: {
            styles: [
              href,
              './styles/style.css',
            ],
          },
        },
      ]);
      expect(await runner.page.evaluate((href) => { return !!window.document.querySelector(`link[orig-src="${href}"]`); }, href)).toEqual(true);
      expect(await runner.page.evaluate(() => {
        return window.getComputedStyle(window.document.body).background;
      })).toEqual('rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');
    });
  });

  describe('Head Tags', () => {
    test('it can populate head tags', async () => {
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
            headTags,
          },
        },
      ]);
      for (const headTag of headTags) {
        expect(await runner.page.evaluate(({ href, rel }) => { return !!window.document.querySelector(`link[href="${href}"][rel="${rel}"]`); }, headTag)).toEqual(true);
      }
    });

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
            headTags,
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
            headTags: [{
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
