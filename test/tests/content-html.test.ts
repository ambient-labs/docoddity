import { setupBuild } from '../includes/setup-build.js';

describe('HTML page', () => {
  const configureDocodditySite = setupBuild({
    std: {
      // stdout: chunk => console.log('[Docoddity]', chunk),
      // stderr: chunk => console.error('[Docoddity]', chunk),
    }
  });
  test('it should render an HTML page without a docoddity.json', async () => {
    const pagePath = 'html-page';
    const content = 'foobar';
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `${pagePath}.html`,
        content: `
              <p>${content}</p>
    `,
      },
    ]);
    await runner.goto(`/${pagePath}`);
    const [title, container] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(title).toEqual('');
    expect(container).toEqual(content);
  });

  test('it should render an HTML page with a docoddity.json', async () => {
    const siteTitle = 'Basic Site';
    const pagePath = 'html-page';
    const content = 'foobar';
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `${pagePath}.html`,
        content: `
              <p>${content}</p>
    `,
      },
      {
        filepath: 'docoddity.json',
        content: {
          title: siteTitle,
        },
      }
    ]);
    await runner.goto(`/${pagePath}`);
    const [title, container] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(title).toEqual(siteTitle);
    expect(container.split(siteTitle).join('').trim()).toEqual(content);
  });


  test('it should render a root HTML page', async () => {
    const siteTitle = 'Basic Site';
    const content = 'foobar';
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `index.html`,
        content: `
              <p>${content}</p>
    `,
      },
      {
        filepath: 'docoddity.json',

        content: {
          title: siteTitle,
        },
      }
    ]);
    const [title, container] = await runner.page.evaluate(() => [
      window.document.title,
      window.document.querySelector('body p')?.innerText,
    ]);
    expect(title).toEqual(siteTitle);
    expect(container.split(siteTitle).join('').trim()).toEqual(content);
  });

  test('it should render active pages in nav', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: `zero.html`,
        content: `<p>zero</p>`,
      },
      {
        filepath: `one.html`,
        content: `<p>one</p>`,
      },
      {
        filepath: `data/foo/two.html`,
        content: `<p>two</p>`,
      },
      {
        filepath: 'docoddity.json',

        content: {
          nav: {
            "left": [
              { text: 'Zero', url: '/zero' },
              { text: 'One', url: '/one' },
              { text: 'Two', url: '/data/foo/two' },
            ]
          },
        },
      }
    ]);
    await runner.goto(`/zero`);
    await expect(runner.page).toMatchQuerySelectorAll('header.site-head.desktop a', [
      "<a class=\"title\" aria-role=\"title\" href=\"/\"></a>",
      '<a href="/zero" class="active">Zero</a>',
      '<a href="/one">One</a>',
      '<a href="/data/foo/two">Two</a>',
    ]);
    await runner.goto(`/one`);
    await expect(runner.page).toMatchQuerySelectorAll('header.site-head.desktop a', [
      "<a class=\"title\" aria-role=\"title\" href=\"/\"></a>",
      '<a href="/zero">Zero</a>',
      '<a href="/one" class="active">One</a>',
      '<a href="/data/foo/two">Two</a>',
    ]);
    await runner.goto(`/data/foo/two`);
    await expect(runner.page).toMatchQuerySelectorAll('header.site-head.desktop a', [
      "<a class=\"title\" aria-role=\"title\" href=\"/\"></a>",
      '<a href="/zero">Zero</a>',
      '<a href="/one">One</a>',
      '<a href="/data/foo/two" class="active">Two</a>',
    ]);
  });

  test('it should handle relative references', async () => {
    const content = 'foobar';
    const fnResponse = 'baz';
    const { runner, printURL, waitForComputedStyle, waitForScript } = await configureDocodditySite([
      {
        filepath: `index.html`,
        content: `
              <p>${content}</p>
              <script type="module" src="./js.js"></script>
              <script type="module" src="./ts.ts"></script>
              <link rel="stylesheet" href="./style.css" />
    `,
      },
      {
        filepath: 'style.css',
        content: `body { background: red; } `,
      },
      {
        filepath: 'js.js',
        content: `window.js = () => "${fnResponse}js";`,
      },
      {
        filepath: 'ts.ts',
        content: `(window as any).ts = () => "${fnResponse}ts";`,
      },
    ]);
    // await printURL(1000);
    await waitForComputedStyle('background', 'rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');
    await waitForScript('js', fnResponse + 'js');
    await waitForScript('ts', fnResponse + 'ts');
  });
});
