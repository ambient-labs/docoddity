import { vi } from 'vitest';
import os from 'os';
import path from 'path';
import pkg from 'fs-extra';

import { Docoddity } from './docoddity.js';

const {
  exists,
  remove,
  writeFile: _writeFile,
  mkdirp,
} = pkg;

const makePromise = () => {
  let resolve: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return {
    promise,
    resolve: resolve!,
  };
}

type File = string | { filepath: string; contents: string; };
type WriteFiles = (files: File[]) => Promise<void>;
type RemoveFiles = (files: File[]) => Promise<void>;

const withTmpDir = async (fn: (dir: string, writeFiles: WriteFiles, removeFiles: RemoveFiles) => Promise<void>) => {
  const tmpDir = path.resolve(os.tmpdir(), 'docoddity', Math.random().toString(36).slice(2));
  try {
    const writeFiles = getWriteFiles(tmpDir);
    const removeFiles = getRemoveFiles(tmpDir)
    await fn(tmpDir, writeFiles, removeFiles);
  } catch (err) {
    throw err;
  } finally {
    await remove(tmpDir);
  }
};

const getRemoveFiles = (cwd: string): RemoveFiles => async (files) => {
  await Promise.all(files.map(async file => {
    const filepath = typeof file === 'string' ? file : file.filepath;
    await remove(path.resolve(cwd, filepath));
  }));
};

const writeFile = async (cwd: string, file: File) => {
  const filepath = typeof file === 'string' ? file : file.filepath;
  const contents = typeof file === 'string' ? '' : file.contents;
  await mkdirp(path.resolve(cwd, path.dirname(filepath)));
  await _writeFile(path.resolve(cwd, filepath), contents);
}

const getWriteFiles = (cwd: string): WriteFiles => async (files) => {
  // console.log('write these files:', files.map(file => typeof file === 'string' ? file : file.filepath))
  await Promise.all(files.map(file => writeFile(cwd, file)));
};

describe('Docoddity', () => {
  test('it gets a list of md + html files', async () => withTmpDir(async (tmpDir, writeFiles) => {
    const files = ['file1.md', 'foo.js', 'file2.md', 'bar.css', 'file3.html', 'dir1/file4.md', 'exec.sh', 'dir2/file5.html', 'dir1/dir3/dir4/file6.md'];
    await writeFiles(files);

    const docoddity = new Docoddity({
      inputDir: tmpDir,
      buildDir: '.build',
    });

    await expect(docoddity.files).toEqualSet(files.filter(f => f.endsWith('html') || f.endsWith('md')));
  }));

  test('it throws if given a bad docoddity.json', async () => withTmpDir(async (tmpDir, writeFiles) => {
    const files = ['docoddity.json'];
    await writeFiles(files);

    const docoddity = new Docoddity({
      inputDir: tmpDir,
      buildDir: '.build',
    });

    await expect(() => docoddity.files).rejects.toThrow();
  }));

  test('it throws if given a docoddity.json referencing files that do not exist', async () => withTmpDir(async (tmpDir, writeFiles) => {
    await writeFiles([{
      filepath: 'docoddity.json',
      contents: JSON.stringify({
        head: ['foo.css'],
        body: ['foo.js'],
      })
    }]);

    const docoddity = new Docoddity({
      inputDir: tmpDir,
      buildDir: '.build',
    });

    await expect(() => docoddity.files).rejects.toThrow();
  }));

  test('it also gets docoddity.json, if it exists', async () => withTmpDir(async (tmpDir, writeFiles) => {
    const files = ['.docoddity.json', {
      filepath: 'docoddity.json',
      contents: JSON.stringify({}),
    }, 'foo.js', 'foo.json', 'file2.md', 'bar.css', 'file3.html', 'dir1/file4.md', 'exec.sh', 'dir2/file5.html', 'dir1/dir3/dir4/file6.md'];
    await writeFiles(files);

    const docoddity = new Docoddity({
      inputDir: tmpDir,
      buildDir: '.build',
    });

    const stringFiles: string[] = files.filter(f => typeof f === 'string');

    await expect(docoddity.files).toEqualSet([
      'docoddity.json',
      ...stringFiles.filter(f => f.endsWith('html') || f.endsWith('md')),
    ]);
  }));

  test('it also gets the files contained within docoddity json', async () => withTmpDir(async (tmpDir, writeFiles) => {
    const files = [
      '.docoddity.json',
      'qux.js',
      'foo2.js',
      'foo.js',
      'foo.json',
      'file2.md',
      'bar.css',
      'file3.html',
      'dir1/file4.js',
      'exec.sh',
      'dir2/file5.html',
      'dir1/dir3/dir4/file6.md',
      {
        filepath: 'docoddity.json',
        contents: JSON.stringify({
          head: [
            'foo.js',
            'bar.css',
          ],
          body: [
            'qux.js',
            'dir1/file4.js',
          ],
        })
      }];
    await writeFiles(files);

    const docoddity = new Docoddity({
      inputDir: tmpDir,
      buildDir: '.build',
    });

    const stringFiles: string[] = files.filter(f => typeof f === 'string');

    await expect(docoddity.files).toEqualSet([
      'docoddity.json',
      ...stringFiles.filter(f => f.endsWith('html') || f.endsWith('md')),
      'foo.js',
      'bar.css',
      'qux.js',
      'dir1/file4.js',
    ]);
  }));

  describe('watch', () => {
    type StopWatching = () => Promise<void>;
    let stopWatching: null | StopWatching = null;
    afterEach(async () => {
      if (stopWatching) {
        await stopWatching();
        stopWatching = null;
      }
    });

    const callbackWithCount = (expectedCount: number, delay = 0) => {
      const { promise: countPromise, resolve: filesSatisfiedResolver } = makePromise();
      const { promise: readyPromise, resolve: readyResolver } = makePromise();
      let i = 0;
      let timer;
      const callback = vi.fn().mockImplementation((event) => {
        if (event.type === 'ready') {
          readyResolver();
        } else {
          // console.log(event);
          i += 1;
          if (i >= expectedCount) {
            if (timer) {
              clearTimeout(timer);
            }
            timer = setTimeout(() => {
              filesSatisfiedResolver();
            }, delay)
          }
        }
      });

      return {
        countPromise,
        readyPromise,
        callback,
      }
    }

    test('it watches new .md and .html files that come in', async () => withTmpDir(async (tmpDir, writeFiles) => {
      const files = ['file1.md', 'foo.js', 'file2.md', 'bar.css', 'file3.html', 'dir1/file4.md', 'exec.sh', 'dir2/file5.html', 'dir1/dir3/dir4/file6.md'];
      const newFiles = ['file7.md', 'foo8.js', 'file9.md', 'bar10.css', 'file11.html', 'dir2/file12.md', 'exec2.sh', 'dir3/file13.html', 'dir10/dir3/dir4/file14.md'];

      await writeFiles(files);

      const expectedFiles = [...new Set([
        ...files.filter(f => f.endsWith('html') || f.endsWith('md')),
        ...newFiles.filter(f => f.endsWith('html') || f.endsWith('md')),
      ])];
      const expectedCount = expectedFiles.length;
      const { readyPromise, countPromise, callback } = callbackWithCount(expectedCount);

      const docoddity = new Docoddity({
        inputDir: tmpDir,
        buildDir: '.build',
      });

      stopWatching = docoddity.watch(callback);
      await readyPromise;
      await writeFiles(newFiles);

      await countPromise;

      for (const file of expectedFiles) {
        expect(callback).toHaveBeenCalledWith({
          type: 'add',
          data: file,
        });
      }
    }));

    test('it watches for changes to .md and .html files that come in', async () => withTmpDir(async (tmpDir, writeFiles) => {
      const files = ['file1.md', 'foo.js', 'file2.md', 'bar.css', 'file3.html', 'dir1/file4.md', 'exec.sh', 'dir2/file5.html', 'dir1/dir3/dir4/file6.md'];

      await writeFiles(files);

      const expectedFiles = files.filter(f => f.endsWith('html') || f.endsWith('md'));

      const expectedCount = expectedFiles.length * 2;
      const { readyPromise, countPromise, callback } = callbackWithCount(expectedCount);

      const docoddity = new Docoddity({
        inputDir: tmpDir,
        buildDir: '.build',
      });

      stopWatching = docoddity.watch(callback);
      await readyPromise;
      await writeFiles(expectedFiles.map(file => ({
        filepath: file,
        contents: '1',
      })));

      await countPromise;

      for (const file of expectedFiles) {
        expect(callback).toHaveBeenCalledWith({
          type: 'add',
          data: file,
        });
        expect(callback).toHaveBeenCalledWith({
          type: 'change',
          data: file,
        });
      }

    }));

    test('it watches for deletions of .md and .html files that come in', async () => withTmpDir(async (tmpDir, writeFiles, removefiles) => {
      const files = ['file1.md', 'foo.js', 'file2.md', 'bar.css', 'file3.html', 'dir1/file4.md', 'exec.sh', 'dir2/file5.html', 'dir1/dir3/dir4/file6.md'];

      await writeFiles(files);

      const expectedFiles = files.filter(f => f.endsWith('html') || f.endsWith('md'));

      const expectedCount = expectedFiles.length * 2;
      const { readyPromise, countPromise, callback } = callbackWithCount(expectedCount);

      const docoddity = new Docoddity({
        inputDir: tmpDir,
        buildDir: '.build',
      });

      stopWatching = docoddity.watch(callback);
      await readyPromise;
      await removefiles(expectedFiles);

      await countPromise;

      for (const file of expectedFiles) {
        expect(callback).toHaveBeenCalledWith({
          type: 'add',
          data: file,
        });
        expect(callback).toHaveBeenCalledWith({
          type: 'unlink',
          data: file,
        });
      }

    }));

    test('it watches for docoddity contents', async () => withTmpDir(async (tmpDir, writeFiles) => {
      const files = ['file1.md', 'foo.js', 'file2.ts', 'bar.css', 'dir1/dir3/dir4/file6.css', {
        filepath: 'docoddity.json',
        contents: JSON.stringify({
          head: [
            'foo.js',
            'bar.css',
          ],
          body: [
            'dir1/dir3/dir4/file6.css',
          ],
        }),
      }];

      await writeFiles(files);

      const stringFiles: string[] = files.filter(f => typeof f === 'string');

      const expectedFiles = stringFiles.filter(f => f.endsWith('html') || f.endsWith('md') || f.endsWith('js') || f.endsWith('css'));
      const { readyPromise, countPromise, callback } = callbackWithCount(expectedFiles.length);

      const docoddity = new Docoddity({
        inputDir: tmpDir,
        buildDir: '.build',
      });

      stopWatching = docoddity.watch(callback);
      await readyPromise;
      await countPromise;

      for (const file of expectedFiles) {
        expect(callback).toHaveBeenCalledWith({
          type: 'add',
          data: file,
        });
      }
    }));

    test('it watches for new files in docoddity contents', async () => withTmpDir(async (tmpDir, writeFiles) => {
      const files = ['file1.md', 'dir0/bar.css', 'dir1/dir3/dir4/file6.css', {
        filepath: 'docoddity.json',
        contents: JSON.stringify({
          head: [
            'dir0/bar.css',
          ],
          body: [
          ],
        }),
      }];

      await writeFiles(files);

      const { readyPromise, countPromise, callback } = callbackWithCount(files.length, 500);

      const docoddity = new Docoddity({
        inputDir: tmpDir,
        buildDir: '.build',
      });

      stopWatching = docoddity.watch(callback);
      await readyPromise;
      await writeFiles([{
        filepath: 'docoddity.json',
        contents: JSON.stringify({
          head: [
            'dir0/bar.css',
          ],
          body: [
            'dir1/dir3/dir4/file6.css',
          ],
        }),
      }]);
      await countPromise;

      expect(callback).toHaveBeenCalledTimes(files.length + 2); // add 1 for change, 1 for "ready"

      expect(callback).toHaveBeenCalledWith({
        type: 'change',
        data: 'docoddity.json',
      });

      for (const file of files) {
        if (typeof file === 'string') {
          expect(callback).toHaveBeenCalledWith({
            type: 'add',
            data: file,
          });
        }
      }
    }), 1000);

    test('it watches for removed files in docoddity contents', async () => withTmpDir(async (tmpDir, writeFiles) => {
      const files = ['file1.md', 'dir0/bar.css', 'dir1/dir3/dir4/file6.css', {
        filepath: 'docoddity.json',
        contents: JSON.stringify({
          head: [
            'dir0/bar.css',
          ],
          body: [
            'dir1/dir3/dir4/file6.css',
          ],
        }),
      }];

      await writeFiles(files);

      const { readyPromise, countPromise, callback } = callbackWithCount(files.length, 500);

      const docoddity = new Docoddity({
        inputDir: tmpDir,
        buildDir: '.build',
      });

      stopWatching = docoddity.watch(callback);
      await readyPromise;
      await writeFiles([{
        filepath: 'docoddity.json',
        contents: JSON.stringify({
          head: [
            'dir0/bar.css',
          ],
          body: [
          ],
        }),
      }]);
      await countPromise;

      expect(callback).not.toHaveBeenCalledWith({
        type: 'error',
        data: expect.anything(),
      });

      expect(callback).toHaveBeenCalledWith({
        type: 'change',
        data: 'docoddity.json',
      });

      for (const file of files) {
        if (typeof file === 'string') {
          expect(callback).toHaveBeenCalledWith({
            type: 'add',
            data: file,
          });
        }
      }
      expect(callback).toHaveBeenCalledWith({
        type: 'unlink',
        data: 'dir1/dir3/dir4/file6.css',
      });
      expect(callback).toHaveBeenCalledTimes(files.length + 3); // add 1 for change, 1 for "ready", 1 for "unlink"
    }), 1000);

    test('it handles non-string files', async () => withTmpDir(async (tmpDir, writeFiles) => {
      const files = ['file1.md', 'foo.js', 'file2.ts', 'bar.css', 'dir1/dir3/dir4/file6.css', {
        filepath: 'docoddity.json',
        contents: JSON.stringify({
          head: [
            {
              src: 'foo.js',
              bar: 'bar',
            },
            'bar.css',
          ],
          body: [
            {
              src: 'dir1/dir3/dir4/file6.css',
              foo: 'foo',
            },
          ],
        }),
      }];

      await writeFiles(files);

      const stringFiles: string[] = files.filter(f => typeof f === 'string');

      const expectedFiles = stringFiles.filter(f => f.endsWith('html') || f.endsWith('md') || f.endsWith('js') || f.endsWith('css'));
      const { readyPromise, countPromise, callback } = callbackWithCount(expectedFiles.length);

      const docoddity = new Docoddity({
        inputDir: tmpDir,
        buildDir: '.build',
      });

      stopWatching = docoddity.watch(callback);
      await readyPromise;
      await countPromise;

      for (const file of expectedFiles) {
        expect(callback).toHaveBeenCalledWith({
          type: 'add',
          data: file,
        });
      }
    }), 1000);
  });

});
