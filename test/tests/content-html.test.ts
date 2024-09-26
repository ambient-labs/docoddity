import { setupBuild } from '../includes/setup-build.js';

describe('HTML page', () => {
  const configureDocodditySite = setupBuild({
    std: {
      // stdout: console.log,
      // stderr: console.error,
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
});
