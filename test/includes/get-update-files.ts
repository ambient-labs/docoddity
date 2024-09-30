import path from 'path';
import {
  type DocoddityTestFile
} from "./types.js";
import { writeFile } from './writeFile.js';
import { exists } from 'fs-extra';
import { waitFor } from './wait-for.js';
import { withExt } from '../../packages/docoddity/src/bin/lib/utils/with-ext.js';

const DEFAULT_PACKAGE_JSON = {
  "name": "docs",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "docoddity start",
    "build": "docoddity build --output ./build"
  },
  "devDependencies": {
    "docoddity": "workspace:*"
  }
};

const getFilesForUpdate = (files: DocoddityTestFile[]): DocoddityTestFile[] => {
  const hasPackageJSON = files.reduce((acc, { filepath }) => acc || filepath === 'package.json', false);

  return [
    ...files,
    hasPackageJSON ? undefined : {
      filepath: 'package.json',
      content: JSON.stringify(DEFAULT_PACKAGE_JSON, null, 2),
    },
  ].filter(Boolean);
};

export const getUpdateFiles = (cwd: string) => async (files: DocoddityTestFile[], waitForDocoddity = true) => {
  await Promise.all([
    ...getFilesForUpdate(files).map(({
      filepath,
      content,
    }) => ({
      filepath,
      resolvedFilepath: path.resolve(cwd, filepath),
      content: typeof content === 'string' ? content : JSON.stringify(content, null, 2),
    })).map(async ({
      filepath,
      resolvedFilepath,
      content,
    }) => {
      await writeFile(resolvedFilepath, content);
      if (waitForDocoddity && !['package.json', 'docoddity.json'].includes(filepath) && (filepath.endsWith('html') || filepath.endsWith('md'))) {
        // For our tests, we need to wait for the .docoddity/site version of the HTML file to get writen
        const targetHTMLFilepath = withExt(filepath, 'html');
        const docoddityFilepath = path.resolve(cwd, '.docoddity/site', targetHTMLFilepath);
        const duration = 500;
        try {
          return await waitFor(async () => {
            if (!await exists(docoddityFilepath)) {
              throw new Error('not yet')
            }
          }, duration);
        } catch (err) {
          throw new Error(`Docoddity file ${docoddityFilepath} was not created in ${duration}ms`);
        }
      }
    }),
  ]);
};
