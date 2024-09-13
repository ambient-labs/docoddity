import { setupDev } from '../includes/setup-dev.js';
import { DocoddityTestFile } from '../includes/types.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';

describe('Dev server', () => {
  const configureDevDocodditySite = setupDev({
    std: {
      // stdout: console.log,
      // stderr: console.error,
    }
  });

  describe('Display', () => {
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
      console.log(title, container)
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
  });

  describe('Listens for changes', () => {
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

  describe('Listens for new files', () => {
    test('it adds an html file', async () => {
      const content = 'foobar';
      const { runner, printURL, waitForSelector, updateFiles } = await configureDevDocodditySite([
        {
          filepath: `index.html`,
          content: `<p>${content}</p>`,
        },
      ], {
        key: 'it adds an html file',
      });

      // await printURL(1000);
      await waitForSelector(`text=${content}`);
      const content2 = 'foobarbaz';

      await updateFiles([
        {
          filepath: `foo.html`,
          content: `<p>${content2}</p>`,
        },
      ],);

      await runner.goto('/foo');

      await waitForSelector(`text=${content2}`);
      const [container] = await runner.page.evaluate(() => [
        window.document.querySelector('body p')?.innerText,
      ]);
      expect(container).toEqual(content2);
    });

    test('it adds a deep HTML file', async () => {
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
          filepath: `foo/bar/baz.html`,
          content: `<p>${content2}</p>`,
        },
      ]);

      await runner.goto('/foo/bar/baz');

      await waitForSelector(`text=${content2}`);
      const [container] = await runner.page.evaluate(() => [
        window.document.querySelector('body p')?.innerText,
      ]);
      expect(container).toEqual(content2);
    });

    test('it adds a markdown file', async () => {
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

      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
      await updateFiles([
        {
          filepath: `two.md`,
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
      const [container] = await runner.page.evaluate(() => [
        window.document.querySelector('body p')?.innerText,
      ]);
      expect(container).toEqual(content2);
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
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
      const [container] = await runner.page.evaluate(() => [
        window.document.querySelector('body p')?.innerText,
      ]);
      expect(container).toEqual(content2);
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

  describe('Listens for removed files', () => {
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
        'two',
      ].map((title, order) => ({
        filepath: `${title}.md`,
        content: getMarkdownContent(`Contents: ${title}`, {
          title,
          order,
        }).trim(),
      }));
      const { runner, printURL, removeFiles } = await configureDevDocodditySite(files);

      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(true);
      await runner.page.evaluate(() => {
        const button = window.document.querySelector('a[aria-role="next"]') as HTMLButtonElement;
        button.click();
      });
      await runner.waitForUrl();
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(true);

      await removeFiles([
        'two.md',
      ]);
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
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
      const { runner, printURL, removeFiles } = await configureDevDocodditySite(files, {
        key: 'it removes a stylesheet when docoddity is present',
      });

      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(true);
      await runner.page.evaluate(() => {
        const button = window.document.querySelector('a[aria-role="next"]') as HTMLButtonElement;
        button.click();
      });
      await runner.waitForUrl();
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(true);

      await removeFiles([
        'two.md',
      ]);
      expect(await runner.page.evaluate(() => !!window.document.querySelector('a[aria-role="next"]'))).toEqual(false);
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
});
