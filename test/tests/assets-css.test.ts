import { setupBuild } from '../includes/setup-build.js';
import { toSelector } from '../includes/to-selector.js';

describe('CSS Assets', () => {
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
          head: [
            './styles/style.css',
          ],
        },
      }
    ]);
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
          body: [
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
      media: "screen",
    };
    const styleMobile = {
      href: './styles/mobile.css',
      media: "screen and (max-width: 700px)",
    };
    const { runner, printURL } = await configureDocodditySite([
      content,
      {
        filepath: style.href,
        content: `html body { background: blue; } `,
      },
      {
        filepath: styleMobile.href,
        content: `html body { background: red; } `,
      },
      {
        filepath: 'docoddity.json',
        content: {
          head: [
            style,
            styleMobile,
          ],
        },
      },
    ]);
    // await printURL(1000);
    expect(await runner.page.evaluate(() => {
      return window.getComputedStyle(window.document.body).background;
    })).toEqual('rgb(0, 0, 255) none repeat scroll 0% 0% / auto padding-box border-box');
    runner.page.setViewportSize({ width: 600, height: 600 });
    expect(await runner.page.evaluate(() => {
      return window.getComputedStyle(window.document.body).background;
    })).toEqual('rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box');
  });

  test('it should render an external CSS asset', async () => {
    const href = 'https://raw.githubusercontent.com/elad2412/the-new-css-reset/main/css/reset.css';
    const { runner, printURL } = await configureDocodditySite([
      content,
      {
        filepath: 'docoddity.json',
        content: {
          body: [
            href,
          ],
        }
      },
    ]);
    await expect(runner.page).toContainTags([
      toSelector({
        tag: 'link',
        href,
      }),
    ]);
  });

  test('it should render both local and external CSS assets', async () => {
    const href = 'https://raw.githubusercontent.com/elad2412/the-new-css-reset/main/css/reset.css';
    const { runner, printURL } = await configureDocodditySite([
      content,
      {
        filepath: './styles/style.css',
        content: `html body { color: blue; } `,
      },
      {
        filepath: 'docoddity.json',
        content: {
          body: [
            href,
            './styles/style.css',
            {
              tag: 'link',
              href: 'data:text/css;base64,Ym9keSB7CiAgYmFja2dyb3VuZDogcmVkOwp9',
            },
          ],
        },
      },
    ]);
    // await printURL(1000);
    expect(await runner.page.evaluate(() => {
      return [
        window.getComputedStyle(window.document.body).background,
        window.getComputedStyle(window.document.body).color,
      ];
    })).toEqual([
      'rgb(255, 0, 0) none repeat scroll 0% 0% / auto padding-box border-box',
      'rgb(0, 0, 255)',
    ]);
  });
});

