import path from 'path';
import { exists } from 'fs-extra';
import { waitFor } from './wait-for.js';
import { withExt } from '../../packages/docoddity/src/bin/lib/utils/with-ext.js';

export const getWaitForDocoddityFileToBeWritten = (cwd: string) => async (filepath: string) => {
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
};

