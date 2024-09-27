import { setupDev } from '../includes/setup-dev.js';
import { DocoddityTestFile } from '../includes/types.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Dev: Listens for changes', () => {
  const configureDevDocodditySite = setupDev({
    std: {
      stdout: console.log,
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

  test.only('it changes a markdown file name, and that gets reflected in the <title>, page title, sidebar, and pagination', async () => {
    const { runner, printURL, renameFiles, waitFor } = await configureDevDocodditySite([
      // {
      //   filepath: `index.md`,
      //   content: getMarkdownContent('index body', { title: 'Index Title' }),
      // },
      {
        filepath: `docs/one.md`,
        content: getMarkdownContent('one body', { title: 'One Title', order: 0, }),
      },
      {
        filepath: `docs/two.md`,
        content: getMarkdownContent('two body', { title: 'Two Title', order: 1, }),
      },
    ]);

    // await printURL(1000, '/docs/one');
    const expectPage = async (title: string, container: string, nav: string[], prev: string, next: string, url?: string) => {
      if (url) {
        await runner.goto(url);
      }
      await waitFor(async () => {
        expect(await runner.page.evaluate(() => {
          const prev = window.document.querySelector('a[aria-role="prev"] span');
          const next = window.document.querySelector('a[aria-role="next"] span');
          return [
            window.document.title,
            window.document.querySelector('article#page-article p')?.innerText,
            Array.from(window.document.querySelectorAll('nav#left-nav a')).map(el => el.outerHTML.trim()),
            prev ? prev.innerText : undefined,
            next ? next.innerText : undefined,
          ];
        })).toEqual([title, container, nav, prev, next]);
      });
    };

    await expectPage('Two Title', 'two body', [
      "<a href=\"/docs/one\">One Title</a>",
      "<a href=\"/docs/two\">Two Title</a>",
    ], 'One Title', undefined, '/docs/two');

    await expectPage('One Title', 'one body', [
      "<a href=\"/docs/one\">One Title</a>",
      "<a href=\"/docs/two\">Two Title</a>",
    ], undefined, 'Two Title', '/docs/one');

    await renameFiles([
      {
        source: 'docs/two.md', target: 'docs/three.md',
        content: getMarkdownContent('three body', { title: 'Three Title', order: 1, }),
      },
    ]);

    await expectPage('One Title', 'one body', [
      "<a href=\"/docs/one\">One Title</a>",
      "<a href=\"/docs/three\">Three Title</a>",
    ], undefined, 'Three Title');

    await expectPage('Three Title', 'three body', [
      "<a href=\"/docs/one\">One Title</a>",
      "<a href=\"/docs/three\">Three Title</a>",
    ], 'One Title', undefined, '/docs/three');
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
