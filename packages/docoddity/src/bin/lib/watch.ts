import chokidar from 'chokidar';
import path from 'path';
import type {
  WatchCallback,
  DocoddityContents,
  Folders
} from "./types.js";
import { readDocoddityJSON } from './utils/read-docoddity-json.js';
import { getDocoddityContents } from './utils/get-docoddity-contents.js';
import { isWatched } from './utils/is-watched.js';
import { getRemovedDocoddityContents } from './utils/get-removed-docoddity-contents.js';
import type { Sitemap } from './sitemap.js';
import type { Docoddity } from './docoddity.js';
// import { makeRelative } from './utils/make-relative.js';

export const watch = (docoddity: Docoddity, callback: WatchCallback) => {
  const {
    folders: {
      sourceDir,
      targetDir
    },
    sitemap,
  } = docoddity;
  // const getRelativeFile = makeRelative(sourceDir);
  const docoddityPath = `${path.resolve(sourceDir)}/docoddity.json`;
  let docoddityContents: DocoddityContents;
  const watcher = chokidar.watch([
    `${path.resolve(sourceDir)}/**/*.md`,
    `${path.resolve(sourceDir)}/**/*.html`,
    docoddityPath,
  ], {
    ignorePermissionErrors: false,
    usePolling: true,
    // ignored: getIgnoredFiles(targetDir),
    ignored: (absoluteFilepath) => {
      return absoluteFilepath.includes('node_modules') || absoluteFilepath.includes(targetDir);
    }

    // ignoreInitial: true,
    // awaitWriteFinish: {
    //   stabilityThreshold: 1000,
    //   pollInterval: 10,
    // },
  })
    .on('ready', () => {
      callback({ type: 'ready' });
    })
    .on('all', async (event, sourceFilepath) => {
      try {
        if (event === 'add' || event === 'change' || event === 'unlink') {
          // console.log('sourceFilepath', sourceFilepath)
          callback({ type: event, data: sourceFilepath, sitemap });
          // if (sourceFilepath === docoddityPath) {
          //   // const prevDocoddityContents = docoddityContents;
          //   // docoddityContents = await readDocoddityJSON(sourceDir);
          //   // for await (const file of getDocoddityContents(sourceDir, docoddityContents)) {
          //   //   if (!isWatched(watcher, file)) {
          //   //     watcher.add(file);
          //   //   }
          //   // }
          //   // for (const file of getRemovedDocoddityContents(docoddityContents, prevDocoddityContents)) {
          //   //   watcher.unwatch(file);
          //   //   callback({ type: 'unlink', data: file, sitemap });
          //   // }
          // }
        } else if (!IGNORED_EVENTS.includes(event)) {
          console.warn(`Unhandled event: ${event}`);
        }
      } catch (err: unknown) {
        callback({ type: 'error', data: err instanceof Error ? err : new Error(JSON.stringify(err)) });
      }
    });

  return async () => {
    await watcher.close();
  };
}

const IGNORED_EVENTS = [
  'unlinkDir',
];
