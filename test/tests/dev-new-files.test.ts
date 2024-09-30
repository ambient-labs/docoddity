import { setupDev } from '../includes/setup-dev.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Listens for new files', () => {
  const configureDevDocodditySite = setupDev({
    std: {
      // stdout: chunk => console.log('[Docoddity]', chunk),
      // stderr: chunk => console.error('[Docoddity]', chunk),
    }
  });
  test('it adds an html file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitFor, waitForSelector, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.html`,
        content: `<p>${content}</p>`,
      },
    ]);

    await waitForSelector(`text=${content}`);
    const content2 = 'foobarbaz';

    await updateFiles([
      {
        filepath: `foo.html`,
        content: `<p>${content2}</p>`,
      },
    ]);

    await runner.goto('/foo');
    // await printURL(1000);

    await waitForSelector(`text=${content2}`);
  });

  test('it adds a deep HTML file', async () => {
    const content = 'index.html';
    const { runner, printURL, waitForSelector, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.html`,
        content: `<p>${content}</p>`,
      },
    ]);

    // await printURL(1000);
    await waitForSelector(`text=${content}`);
    const content2 = 'foo/bar/baz.html';

    await updateFiles([
      {
        filepath: `foo/bar/baz.html`,
        content: `<p>${content2}</p>`,
      },
    ]);

    await runner.goto('/foo/bar/baz');

    await waitForSelector(`text=${content2}`);
  });

  test.only('it adds a markdown file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector, updateFiles, waitFor } = await configureDevDocodditySite([
      {
        filepath: `docs/index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
    ]);

    await runner.goto('/docs');
    // await printURL(1000);
    await waitForSelector(`text=${content}`);
    const content2 = 'foobarbaz';

    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
    });
    await updateFiles([
      {
        filepath: `docs/twooo.md`,
        content: getMarkdownContent(content2, { title: 'foo' }),
      },
    ]);

    await waitForSelector('a[aria-role="next"]')
    await runner.page.evaluate(() => {
      const button = window.document.querySelector('a[aria-role="next"]') as HTMLButtonElement;
      button.click();
    });
    await runner.waitForUrl();

    await waitForSelector(`text=${content2}`);
    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
    });
  });

  test('it adds an empty markdown file to start', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector, updateFiles, waitFor } = await configureDevDocodditySite([
      {
        filepath: `docs/index.md`,
        content: getMarkdownContent(content, { title: 'foo', order: 0 }),
      },
    ]);

    await runner.goto('/docs');

    // await printURL(1000);
    await waitForSelector(`text=${content}`);
    const content2 = 'foobarbaz';

    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
    });

    await updateFiles([
      {
        filepath: `docs/one.md`,
        content: '',
      },
    ]);

    await waitForSelector('a[aria-role="next"]')
    await runner.page.evaluate(() => {
      const button = window.document.querySelector('a[aria-role="next"]') as HTMLButtonElement;
      button.click();
    });
    await runner.waitForUrl();

    await updateFiles([
      {
        filepath: `one.md`,
        content: getMarkdownContent(content2, { title: 'bar', order: 1 }),
      },
    ]);

    await waitForSelector(`text=${content2}`);
    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
    });
  });

  test('it adds a deep markdown file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
    ]);

    // await printURL(1000);
    await waitForSelector(`text=${content}`);
    const content2 = 'foobarbaz';

    await updateFiles([
      {
        filepath: `foo/bar/baz.md`,
        content: getMarkdownContent(content2, { title: 'foo' }),
      },
    ]);

    await runner.goto('/foo/bar/baz');

    await waitForSelector(`text=${content2}`);
  });

  test('it adds a new stylesheet when no docoddity.json exists', async () => {
    const content = 'foobar';
    const { printURL, waitForComputedStyle, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
      {
        filepath: './styles/style.css',
        content: `body { background: red; } `,
      },
    ]);

    await waitForComputedStyle('background', 'rgb(255, 255, 255) none repeat scroll 0% 0% / auto padding-box border-box');

    await updateFiles([
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './styles/style.css',
          ],
        },
      }
    ]);

    await waitForComputedStyle('background', 'rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box', 2000);
  });

  test('it adds a new stylesheet when docoddity.json exists', async () => {
    const content = 'foobar';
    const { waitForComputedStyle, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.html`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
      {
        filepath: 'docoddity.json',
        content: {
          head: [
          ],
        },
      },
      {
        filepath: './styles/style.css',
        content: `body { background: red; } `,
      },
    ]);

    await waitForComputedStyle('background', 'rgb(255, 255, 255) none repeat scroll 0% 0% / auto padding-box border-box');

    await updateFiles([
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './styles/style.css',
          ],
        },
      }
    ]);

    await waitForComputedStyle('background', 'rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');
  });

  test('it adds a new script when no docoddity.json exists', async () => {
    const content = 'foobar';
    const { printURL, runner, waitForScript, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
      {
        filepath: './scripts/foo.ts',
        content: `window.foo = (i?: string) => "foo";`,
      },
    ]);

    expect(await runner.page.evaluate(() => { return !!(window as any).foo; })).toEqual(false);

    await updateFiles([
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './scripts/foo.ts',
          ],
        },
      }
    ]);
    await waitForScript('foo', 'foo');
  });

  test('it adds a new script when docoddity.json exists', async () => {
    const content = 'foobar';
    const { printURL, runner, waitForScript, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
      {
        filepath: 'docoddity.json',
        content: {
          head: [
          ],
        },
      },
      {
        filepath: './scripts/foo.ts',
        content: `window.foo = (i?: string) => "foo";`,
      },
    ]);

    expect(await runner.page.evaluate(() => { return !!(window as any).foo; })).toEqual(false);

    await updateFiles([
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './scripts/foo.ts',
          ],
        },
      }
    ]);
    await waitForScript('foo', 'foo');
  });
});
