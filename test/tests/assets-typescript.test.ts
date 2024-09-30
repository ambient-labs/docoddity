import { setupBuild } from '../includes/setup-build.js';

describe('Typescript Assets', () => {
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
          head: [
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
import "reflect-metadata";
const formatMetadataKey = Symbol("format");
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
          head: [
            filepath,
          ],
        },
      },
    ]);
    // await printURL(1000);
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

          body: [
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
          body: [
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
          head: [
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
          head: [
            script,
          ],
        },
      },
    ]);
    expect(await runner.page.evaluate(() => window['foo']())).toEqual(fnResponse);
  });
});
