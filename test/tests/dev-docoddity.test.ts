import * as url from 'url';
import {
  writeFile as _writeFile,
  readFile,
} from 'fs-extra';
import { setupBuild } from '../includes/setup-build.js';

import path from 'path';
import { TagDefinition } from '../setup/matchers/toContainTags.js';
import { getMarkdownContent } from '../setup/getMarkdownContent.js';
import { getActions, getClick } from '../includes/getActions.js';
import { DocoddityTestFile } from '../includes/types.js';
import { getElementTransformStyle } from '../includes/get-element-transform-style.js';
import { setupDev } from '../includes/setup-dev.js';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

describe('Docoddity', () => {
  const configureDocodditySite = setupBuild({
    std: {
      stdout: chunk => console.log('[Docoddity]', chunk),
      stderr: chunk => console.error('[Docoddity]', chunk),
    }
  });

  const configureDevDocodditySite = setupDev({
    std: {
      stdout: chunk => console.log('[Docoddity]', chunk),
      stderr: chunk => console.error('[Docoddity]', chunk),
    }
  });

  test('it loads a custom synchronous markdown enhancer', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: 'docoddity.json',
        content: {
          markdown: './get-markdown.js',
        }
      },
      {
        filepath: 'get-markdown.js',
        content: `
          export default (md) => {
            md.renderer.rules.fence = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const code = token.content.trim();
            const language = token.info.trim();
              return \`<foo-bar language="$\{language\}">\${code}</foo-bar>\`;
            }
          };
        `,
      },
      {
        filepath: 'index.md',
        content:
          [
            '# Hello World',
            '```javascript',
            'console.log("Hello World");',
            '```',
          ].join('\n'),
      }
    ]);

    expect(await runner.page.evaluate(() => {
      return document.body.querySelector('foo-bar').outerHTML
    })).toEqual('<foo-bar language="javascript">console.log("Hello World");</foo-bar>')
  });

  test('it loads a custom asynchronous markdown enhancer', async () => {
    const { runner, printURL } = await configureDocodditySite([
      {
        filepath: 'docoddity.json',
        content: {
          markdown: './get-markdown.js',
        }
      },
      {
        filepath: 'get-markdown.js',
        content: `
          export default async (md) => {
            md.renderer.rules.fence = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const code = token.content.trim();
            const language = token.info.trim();
              return \`<foo-bar language="$\{language\}">\${code}</foo-bar>\`;
            }
          };
        `,
      },
      {
        filepath: 'index.md',
        content:
          [
            '# Hello World',
            '```javascript',
            'console.log("Hello World");',
            '```',
          ].join('\n'),
      }
    ]);

    expect(await runner.page.evaluate(() => {
      return document.body.querySelector('foo-bar').outerHTML
    })).toEqual('<foo-bar language="javascript">console.log("Hello World");</foo-bar>')
  });

  describe('Dev', () => {
    it('adds markdown enhancer file when added to docoddity.json', async () => {
      const { runner, printURL, updateFiles, waitFor, waitForDocoddityFileToBeWritten } = await configureDevDocodditySite([
        {
          filepath: './docoddity.json',
          content: {
            title: '1',
          }
        },
        {
          filepath: 'get-markdown.js',
          content: `
          export default async (md) => {
            md.renderer.rules.fence = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const code = token.content.trim();
            const language = token.info.trim();
              return \`<foo-bar language="$\{language\}">\${code}</foo-bar>\`;
            }
          };
        `,
        },
        {
          filepath: 'index.md',
          content:
            [
              '# Hello World',
              '```javascript',
              'console.log("Hello World");',
              '```',
            ].join('\n'),
        }
      ]);
      await waitFor(async () => {
        expect(await runner.page.evaluate(() => {
          return window.document.title;
        })).toEqual('Index | 1');
      });
      expect(await runner.page.evaluate(() => {
        return !!document.body.querySelector('foo-bar');
      })).toEqual(false);

      await updateFiles([
        {
          filepath: './docoddity.json',
          content: {
            title: '2',
            markdown: './get-markdown.js',
          }
        }
      ]);

      await waitFor(async () => {
        expect(await runner.page.evaluate(() => {
          return window.document.title;
        })).toEqual('Index | 2');
      });

      expect(await runner.page.evaluate(() => {
        return document.body.querySelector('foo-bar').outerHTML;
      })).toEqual('<foo-bar language="javascript">console.log("Hello World");</foo-bar>');
    })

    it('reloads markdown enhancer file when changed', async () => {
      const { runner, printURL, updateFiles, waitFor, waitForDocoddityFileToBeWritten } = await configureDevDocodditySite([
        {
          filepath: './docoddity.json',
          content: {
            markdown: './get-markdown.js',
            title: '1',
          }
        },
        {
          filepath: 'get-markdown.js',
          content: `
          export default async (md) => {
            md.renderer.rules.fence = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const code = token.content.trim();
            const language = token.info.trim();
              return \`<foo-bar language="$\{language\}">\${code}</foo-bar>\`;
            }
          };
        `,
        },
        {
          filepath: 'index.md',
          content:
            [
              '# Hello World',
              '```javascript',
              'console.log("Hello World");',
              '```',
            ].join('\n'),
        }
      ]);
      await waitFor(async () => {
        expect(await runner.page.evaluate(() => {
          return window.document.title;
        })).toEqual('Index | 1');
      });
      expect(await runner.page.evaluate(() => {
        return document.body.querySelector('foo-bar').outerHTML;
      })).toEqual('<foo-bar language="javascript">console.log("Hello World");</foo-bar>');

      await updateFiles([
        {
          filepath: 'get-markdown.js',
          content: `
          export default async (md) => {
            md.renderer.rules.fence = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const code = token.content.trim();
            const language = token.info.trim();
              return \`<foo-baz language="$\{language\}">\${code}</foo-baz>\`;
            }
          };
        `,
        },
      ]);


      await waitFor(async () => {
        expect(await runner.page.evaluate(() => {
          return document.body.querySelector('foo-baz').outerHTML;
        })).toEqual('<foo-baz language="javascript">console.log("Hello World");</foo-baz>');
      });

    });

    it('remove markdown enhancer file when removed from docoddity.json', async () => {
      const { runner, printURL, updateFiles, waitFor, waitForDocoddityFileToBeWritten } = await configureDevDocodditySite([
        {
          filepath: './docoddity.json',
          content: {
            title: '1',
            markdown: './get-markdown.js',
          }
        },
        {
          filepath: 'get-markdown.js',
          content: `
          export default async (md) => {
            md.renderer.rules.fence = function (tokens, idx, options, env, self) {
            const token = tokens[idx];
            const code = token.content.trim();
            const language = token.info.trim();
              return \`<foo-bar language="$\{language\}">\${code}</foo-bar>\`;
            }
          };
        `,
        },
        {
          filepath: 'index.md',
          content:
            [
              '# Hello World',
              '```javascript',
              'console.log("Hello World");',
              '```',
            ].join('\n'),
        }
      ]);
      await waitFor(async () => {
        expect(await runner.page.evaluate(() => {
          return window.document.title;
        })).toEqual('Index | 1');
      });

      expect(await runner.page.evaluate(() => {
        return document.body.querySelector('foo-bar').outerHTML;
      })).toEqual('<foo-bar language="javascript">console.log("Hello World");</foo-bar>');

      await updateFiles([
        {
          filepath: './docoddity.json',
          content: {
            title: '2',
          }
        }
      ]);
      await waitFor(async () => {
        expect(await runner.page.evaluate(() => {
          return window.document.title;
        })).toEqual('Index | 2');
      });
      expect(await runner.page.evaluate(() => {
        return !!document.body.querySelector('foo-bar');
      })).toEqual(false);

    })
  });
});

