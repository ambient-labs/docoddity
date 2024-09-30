import { setupDev } from '../includes/setup-dev.js';
import { DocoddityTestFile } from '../includes/types.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Dev: Display', () => {
  const configureDevDocodditySite = setupDev({
    std: {
      // stdout: chunk => console.log('[Docoddity]', chunk),
      // stderr: chunk => console.error('[Docoddity]', chunk),
    }
  });
  test('it displays an html file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector } = await configureDevDocodditySite([
      {
        filepath: `index.html`,
        content: `<p>${content}</p>`,
      },
    ]);

    // await printURL(1000);
    await waitForSelector(`text=${content}`);
    const [title, container] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(title).toEqual('');
    expect(container).toEqual(content);
  });

  test('it displays a non-index html file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector } = await configureDevDocodditySite([
      {
        filepath: `foo.html`,
        content: `<p>${content}</p>`,
      },
    ]);

    await runner.goto('/foo');
    await waitForSelector(`text=${content}`);
    const [title, container] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(title).toEqual('');
    expect(container).toEqual(content);
  });

  test('it displays a markdown file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector } = await configureDevDocodditySite([
      {
        filepath: `index.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
    ]);

    // await printURL(1000);

    await waitForSelector(`text=${content}`);
    const [title, container] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(title).toEqual('foo');
    expect(container).toEqual(content);
  });

  test('it displays a non-index markdown file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector } = await configureDevDocodditySite([
      {
        filepath: `foo.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
    ]);

    await runner.goto('/foo');
    await waitForSelector(`text=${content}`);
    const [title, container] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(title).toEqual('foo');
    expect(container).toEqual(content);
  });

  test('it displays a stylesheet', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector } = await configureDevDocodditySite([
      {
        filepath: `index.html`,
        content: `<p>${content}</p>`,
      },
      {
        filepath: './styles/style.css',
        content: `body { background: red; } `,
      },
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            './styles/style.css',
          ],
        },
      }
    ]);

    // await printURL(1000);
    await waitForSelector(`text=${content}`);
    const bg = await runner.page.evaluate(() => {
      return window.getComputedStyle(window.document.body).background;
    });
    expect(bg).toEqual('rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');
  });

  test('it displays Javascript', async () => {
    const fnResponse = 'foobarbaz1';
    const content = 'foobar';
    const { runner, printURL, waitForSelector } = await configureDevDocodditySite([
      {
        filepath: `index.html`,
        content: `<p>${content}</p>`,
      },
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
    await waitForSelector(`text=${content}`);
    expect(await runner.page.evaluate(() => { return window['foo'](); })).toEqual(fnResponse);
  });

  describe('Trailing slashes', () => {
    test('it works without a trailing slash', async () => {
      const content = 'foobar';
      const markdownContent = 'foobarbaz';
      const { runner, printURL, waitForSelector } = await configureDevDocodditySite([
        {
          filepath: `index.html`,
          content: `<p>${content}</p>`,
        },
        {
          filepath: `docs/index.md`,
          content: getMarkdownContent(markdownContent, { title: 'Docs' }),
        },
      ]);

      await waitForSelector(`text=${content}`, 500);
      await runner.goto('/docs');
      await waitForSelector(`text=${markdownContent}`, 500);
    });

    test('it works with a trailing slash', async () => {
      const content = 'foobar';
      const markdownContent = 'foobarbaz';
      const { runner, printURL, waitForSelector } = await configureDevDocodditySite([
        {
          filepath: `index.html`,
          content: `<p>${content}</p>`,
        },
        {
          filepath: `docs/index.md`,
          content: getMarkdownContent(markdownContent, { title: 'Docs' }),
        },
      ]);

      await waitForSelector(`text=${content}`, 500);
      await runner.goto('/docs/');
      await waitForSelector(`text=${markdownContent}`, 500);
    });
  });
});
