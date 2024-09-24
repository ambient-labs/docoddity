import { setupDev } from '../includes/setup-dev.js';
import { DocoddityTestFile } from '../includes/types.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Dev: Listens for changes', () => {
  const configureDevDocodditySite = setupDev({
    std: {
      // stdout: console.log,
      // stderr: console.error,
    }
  });
  test('it changes an html file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.html`,
        content: `<p>${content}</p>`,
      },
    ]);

    // await printURL(1000);
    await waitForSelector(`text=${content}`);
    const content2 = 'foobarbaz';

    await updateFiles([
      {
        filepath: `index.html`,
        content: `<p>${content2}</p>`,
      },
    ]);

    await waitForSelector(`text=${content2}`);
    const [container] = await runner.page.evaluate(() => [
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(container).toEqual(content2);
  });

  test('it changes a non-index html file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `foo.html`,
        content: `<p>${content}</p>`,
      },
    ]);
    await runner.goto('/foo');

    await waitForSelector(`text=${content}`);
    const content2 = 'foobarbaz';

    await updateFiles([
      {
        filepath: `foo.html`,
        content: `<p>${content2}</p>`,
      },
    ]);

    await waitForSelector(`text=${content2}`);
    const [container] = await runner.page.evaluate(() => [
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(container).toEqual(content2);
  });

  test('it changes a markdown file', async () => {
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
        filepath: `index.md`,
        content: `<p>${content2}</p>`,
      },
    ]);

    await waitForSelector(`text=${content2}`);
    const [container] = await runner.page.evaluate(() => [
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(container).toEqual(content2);
  });

  test('it changes a non-root markdown file', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `foo.md`,
        content: getMarkdownContent(content, { title: 'foo' }),
      },
    ]);

    await runner.goto('/foo');
    // await printURL(1000);
    await waitForSelector(`text=${content}`);
    const content2 = 'foobarbaz';

    await updateFiles([
      {
        filepath: `foo.md`,
        content: `<p>${content2}</p>`,
      },
    ]);

    await waitForSelector(`text=${content2}`);
    const [container] = await runner.page.evaluate(() => [
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(container).toEqual(content2);
  });

  test('it modifies a stylesheet', async () => {
    const content = 'foobar';
    const { printURL, waitForComputedStyle, updateFiles } = await configureDevDocodditySite([
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
    await waitForComputedStyle('background', 'rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');

    await updateFiles([
      {
        filepath: './styles/style.css',
        content: `body { background: blue; } `,
      },
    ]);

    await waitForComputedStyle('background', 'rgb(0, 0, 255) none repeat scroll 0% 0% / auto padding-box border-box');
  });

  test('it modifies a script', async () => {
    const content = 'foobar';
    const { waitForScript, updateFiles } = await configureDevDocodditySite([
      {
        filepath: `index.html`,
        content: `<p>${content}</p>`,
      },
      {
        filepath: './scripts/foo.ts',
        content: `window.foo = (i?: string) => "foo";`,
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

    await waitForScript('foo', 'foo');

    await updateFiles([
      {
        filepath: './scripts/foo.ts',
        content: `window.foo = (i?: string) => "bar";`,
      },
    ]);

    await waitForScript('foo', 'bar');
  });
});
