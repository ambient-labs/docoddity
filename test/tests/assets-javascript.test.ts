import { setupBuild } from '../includes/setup-build.js';
import { toSelector } from '../includes/to-selector.js';
import { TagDefinition } from '../setup/matchers/toContainTags.js';


describe('Javascript Assets', () => {
  const configureDocodditySite = setupBuild({
    std: {
      // stdout: console.log,
      // stderr: console.error,
    }
  });

  const content =
  {
    filepath: `index.html`,
    content: `
              <p>foobar</p>
    `,
  };
  test('it should render a single local javascript asset', async () => {
    const fnResponse = 'foobarbaz1';
    const { runner, printURL } = await configureDocodditySite([
      content,
      {
        filepath: './scripts/foo.js',
        content: `window.foo = () => "${fnResponse}";`,
      },
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './scripts/foo.js',
          ],
        },
      },
    ]);
    // await printURL(1000);
    expect(await runner.page.evaluate(() => { return window['foo'](); })).toEqual(fnResponse);
  });

  test('it should render a javascript asset with properties', async () => {
    const fnResponse = 'foobarbaz2';
    const script = {
      tag: 'script',
      src: './scripts/foo.js',
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
          head: [
            script,
          ],
        },
      },
    ]);
    expect(await runner.page.evaluate(() => { return window['foo'](); })).toEqual(fnResponse);
  });

  test('it should render multiple local javascript assets', async () => {
    const fooResponse = 'foo';
    const barResponse = 'bar';
    const bazResponse = 'baz';
    const { runner, printURL } = await configureDocodditySite([
      content,
      {
        filepath: './scripts/foo.js',
        content: `console.log('foo'); window.foo = () => "${fooResponse}";`,
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
          body: [
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
          head: [
            {
              src: script,
              tag: 'script',
            },
          ],
        },
      },
    ]);
    await expect(runner.page).toContainTags([
      toSelector({
        tag: 'script',
        src: script,
      }),
    ]);
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
          body: [
            {
              src: script,
              tag: 'script',
            },
            './scripts/foo.js',
          ],
        },
      },
    ]);
    // await printURL();
    expect(await runner.page.evaluate(() => { return window['foo'](); })).toEqual(fnResponse);
    // expect(await runner.page.evaluate((script) => { return !!window.document.querySelector(`script[src="${script}"]`); }, script)).toEqual(true);
    await expect(runner.page).toContainTags([
      toSelector({
        src: script,
      }),
    ]);
  });
});
