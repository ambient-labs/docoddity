import { setupDev } from '../includes/setup-dev.js';
import { DocoddityTestFile } from '../includes/types.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Listens for removed files', () => {
  const configureDevDocodditySite = setupDev({
    std: {
      // stdout: console.log,
      // stderr: console.error,
    }
  });
  test('it removes an html file', async () => {
    const files: DocoddityTestFile[] = [
      'index',
      'one',
    ].map((title, order) => ({
      filepath: `${title}.html`,
      content: `<p>Contents: ${title}</p>`,
    }));
    const { runner, printURL, waitFor, removeFiles } = await configureDevDocodditySite(files);

    await runner.goto('/one');

    await removeFiles([
      'one.html',
    ]);
    await waitFor(async () => {
      const [container] = await runner.page.evaluate(() => [
        window.document.querySelector('body p')?.innerText,
      ]);
      expect(container).toEqual('Contents: index');
    });
  });

  test('it removes a markdown file', async () => {
    const files: DocoddityTestFile[] = [
      'index',
      'one',
      'two2',
    ].map((title, order) => ({
      filepath: `${title}.md`,
      content: getMarkdownContent(`Contents: ${title}`, {
        title,
        order,
      }).trim(),
    }));
    const { waitFor, runner, printURL, removeFiles } = await configureDevDocodditySite(files);

    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(true);
    });
    await runner.page.evaluate(() => {
      const button = window.document.querySelector('a[aria-role="next"]') as HTMLButtonElement;
      button.click();
    });
    await runner.waitForUrl();
    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(true);
    });

    await removeFiles([
      'two2.md',
    ]);
    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
    });
  });

  test('it removes a stylesheet when docoddity is present', async () => {
    const files: DocoddityTestFile[] = [
      'index',
      'one',
      'two',
    ].map((title, order) => ({
      filepath: `${title}.md`,
      content: getMarkdownContent(`Contents: ${title}`, {
        title,
        order,
      }).trim(),
    }));
    const { runner, printURL, removeFiles, waitFor } = await configureDevDocodditySite(files, {
      key: 'it removes a stylesheet when docoddity is present',
    });

    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(true);
    });
    await runner.page.evaluate(() => {
      const button = window.document.querySelector('a[aria-role="next"]') as HTMLButtonElement;
      button.click();
    });
    await runner.waitForUrl();
    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(true);
    });

    await removeFiles([
      'two.md',
    ]);
    await waitFor(async () => {
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
    });
  });

  test('it removes a stylesheet when docoddity.json is deleted', async () => {
    const content = 'foobar';
    const { printURL, waitForComputedStyle, removeFiles } = await configureDevDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './styles/style.css',
          ],
        },
      },
      {
        filepath: './styles/style.css',
        content: `body { background: red; } `,
      },
    ], {
      key: 'it removes a stylesheet when docoddity.json is deleted',
    });

    await waitForComputedStyle('background', 'rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box', 2000);

    await removeFiles('docoddity.json');

    await waitForComputedStyle('background', 'rgb(255, 255, 255) none repeat scroll 0% 0% / auto padding-box border-box');
  });

  test('it removes a stylesheet when docoddity.json is changed', async () => {
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
            './styles/style.css',
          ],
        },
      },
      {
        filepath: './styles/style.css',
        content: `body { background: red; } `,
      },
    ], {
      key: 'it removes a stylesheet when docoddity.json is changed',
    });

    await waitForComputedStyle('background', 'rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');

    await updateFiles([
      {
        filepath: 'docoddity.json',
        content: {
          head: [
          ],
        },
      }
    ]);

    await waitForComputedStyle('background', 'rgb(255, 255, 255) none repeat scroll 0% 0% / auto padding-box border-box');
  });

  test('it removes a script when docoddity.json is removed', async () => {
    const content = 'foobar';
    const { printURL, runner, waitForScript, updateFiles, removeFiles } = await configureDevDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './scripts/foo.ts',
          ],
        },
      },
      {
        filepath: './scripts/foo.ts',
        content: `window.foo = (i?: string) => "foo";`,
      },
    ], {
      key: 'it removes a script when docoddity.json is removed',
    });

    await waitForScript('foo', 'foo');

    await removeFiles('docoddity.json');

    expect(await runner.page.evaluate(() => { return !!(window as any).foo; })).toEqual(false);
  });

  test('it removes a script when docoddity.json is changed', async () => {
    const content = 'foobar';
    const { printURL, runner, waitFor, waitForScript, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './scripts/foo.ts',
          ],
        },
      },
      {
        filepath: './scripts/foo.ts',
        content: `window.foo = (i?: string) => "foo";`,
      },
    ], {
      key: 'it removes a script when docoddity.json is changed',
    });

    await waitForScript('foo', 'foo');

    await updateFiles([
      {
        filepath: 'docoddity.json',
        content: {
          head: [
          ],
        },
      }
    ]);
    await runner.waitForUrl();

    await waitFor(async () => {
      const foo = await runner.page.evaluate(() => (window as any).foo === undefined);
      if (!foo) {
        throw new Error('foo is not undefined');
      }
    });
  });
});
