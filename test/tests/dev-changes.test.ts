import { getClick } from '../includes/getActions.js';
import { setupDev } from '../includes/setup-dev.js';
import { DocoddityTestFile } from '../includes/types.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Dev: Listens for changes', () => {
  const configureDevDocodditySite = setupDev({
    std: {
      stdout: chunk => console.log('[Docoddity]', chunk),
      stderr: chunk => console.error('[Docoddity]', chunk),
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

  test('it changes markdown frontmatter', async () => {
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
        content: getMarkdownContent(content2, { title: 'bar' }),
      },
    ]);

    await waitForSelector(`text=${content2}`);
    await expect(runner).toMatchPage({
      pageTitle: 'bar',
      bodyText: content2,
    });
  });

  test('it changes markdown frontmatter across all pages', async () => {
    const content = 'foobar';
    const { runner, printURL, waitForSelector, updateFiles, waitFor } = await configureDevDocodditySite([
      {
        filepath: `one.md`,
        content: getMarkdownContent('one', { title: 'one', order: 1 }),
      },
      {
        filepath: `two.md`,
        content: getMarkdownContent('two', { title: 'two', order: 2 }),
      },
      {
        filepath: `three.md`,
        content: getMarkdownContent('three', { title: 'three', order: 3 }),
      },
    ]);

    await runner.goto('/two');

    await updateFiles([
      {
        filepath: `one.md`,
        content: getMarkdownContent('one', { title: 'one2', order: 1 }),
      },
      {
        filepath: `three.md`,
        content: getMarkdownContent('three', { title: 'three2', order: 3 }),
      },
    ]);

    await waitFor(async () => {
      const anchor = await runner.page.evaluate(() => {
        const anchors = Array.from(window.document.querySelectorAll('nav#left-nav a'));
        return anchors.some(anchor => anchor.textContent.includes('three2'));
      });
      expect(anchor).toEqual(true);
    });
    console.log('-----')
    await expect(runner).toMatchPage({
      leftNav: [
        { href: '/one', text: 'one2', },
        { href: '/two', text: 'two', },
        { href: '/three', text: 'three2', },
      ],
      prevHTML: 'one2',
      nextHTML: 'three2',
    });
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

  test('it changes a markdown file name, and that gets reflected in the <title>, page title, sidebar, and pagination', async () => {
    const { runner, printURL, renameFiles, waitFor } = await configureDevDocodditySite([
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

    const click = getClick(runner);

    await runner.goto('/docs/two');
    await expect(runner).toMatchPage({
      pageTitle: 'Two Title',
      bodyText: 'two body',
      leftNav: [
        { href: '/docs/one', text: 'One Title', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      prevHTML: 'One Title',
      nextHTML: undefined,
      bodyH1: 'Two Title',
    });

    await runner.goto('/docs/one')

    await expect(runner).toMatchPage({
      pageTitle: 'One Title',
      bodyText: 'one body',
      leftNav: [
        { href: '/docs/one', text: 'One Title', },
        { href: '/docs/two', text: 'Two Title', },
      ],
      prevHTML: undefined,
      nextHTML: 'Two Title',
      bodyH1: 'One Title',
    });

    // await printURL(1000, '/docs/one');
    await renameFiles([
      {
        source: 'docs/two.md', target: 'docs/three.md',
        content: getMarkdownContent('three body', { title: 'Three Title', order: 1, }),
      },
    ]);

    await waitFor(async () => {
      const anchor = await runner.page.evaluate(() => !!window.document.querySelector('nav#left-nav a[href="/docs/three"]'));
      expect(anchor).toEqual(true);
    });

    await expect(runner).toMatchPage({
      pageTitle: 'One Title',
      bodyText: 'one body',
      leftNav: [
        { href: '/docs/one', text: 'One Title', },
        { href: '/docs/three', text: 'Three Title', },
      ],
      prevHTML: undefined,
      nextHTML: 'Three Title',
      bodyH1: 'One Title',
    });

    await click('a[aria-role="next"]');
    await runner.page.waitForNavigation();

    await expect(runner).toMatchPage({
      pageTitle: 'Three Title',
      bodyText: 'three body',
      leftNav: [
        { href: '/docs/one', text: 'One Title', },
        { href: '/docs/three', text: 'Three Title', },
      ],
      prevHTML: 'One Title',
      nextHTML: undefined,
      bodyH1: 'Three Title',
    });
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
