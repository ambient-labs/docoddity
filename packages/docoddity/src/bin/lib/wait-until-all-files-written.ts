import chokidar from 'chokidar';
import pkg from 'fs-extra';
import { getPromise, } from './utils/get-promise.js';
import type {
  FileDefinition,
} from './types.js';

const {
  existsSync,
} = pkg;

export const waitUntilAllFilesWritten = async (
  _files: FileDefinition[] | Record<string, FileDefinition>,
  createFile: (file: FileDefinition) => Promise<void>,
) => {
  const [ready, readyCallback,] = getPromise();
  let written = 0;
  const files: FileDefinition[] = Array.isArray(_files) ? _files : Object.values(_files);
  const requiredFiles = files.filter(({ required, }) => required !== false).length;
  files.forEach(({ input, output, required, ...rest }) => {
    if (required !== false && !(existsSync(input))) {
      throw new Error(`File ${input} does not exist`);
    }
    chokidar.watch(input).on('all', (
      event,
    ) => {
      if (event === 'add' || event === 'change') {
        written += 1;
        if (written >= requiredFiles) {
          readyCallback();
        }
        void createFile({ input, output, ...rest });
      } else if (!['addDir',].includes(event)) {
        console.log('[Unknown Event]', event);
      }
    });
  });
  await ready;
};
