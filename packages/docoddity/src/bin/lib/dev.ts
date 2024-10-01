import path from 'path';
import {
  mkdirp,
} from './utils/fs.js';
import { createServer } from 'vite';

import {
  isWatchAddEvent,
  isWatchChangeEvent,
  isWatchDeleteEvent,
  type WatchCallback,
  type DevCLIOpts,
} from './types.js';
import { Docoddity } from "./docoddity.js";
import { Files } from './files.js';
import { makeRelative } from './utils/make-relative.js';
import { inlineCSSContent } from './inline-css-content.js';
import { THEMES } from './constants.js';
import { getBuildDir } from './utils/get-build-dir.js';
import { forwardToTrailingSlashPlugin } from './forward-to-trailing-slash-plugin.js';


export const isIncluded = (filepath?: string) => {
  return !!filepath
    && !filepath.startsWith('node_modules')
    && !filepath.startsWith('.')
    && filepath.length <= 200;
};


export const dev = async ({
  port,
  sourceDir: _sourceDir,
  buildDir: _buildDir,
  open = false,
}: DevCLIOpts) => {
  const sourceDir = path.resolve(_sourceDir);
  const targetDir = _buildDir || getBuildDir();

  await Promise.all([
    mkdirp(targetDir),
  ]);
  const docoddity = new Docoddity({
    sourceDir,
    targetDir,
  });
  try {
    await docoddity.applyMarkdownEnhancer();
  } catch (err) {
    console.error('[Docoddity] Failed to apply markdown enhancer');
  }

  const relativeToSource = makeRelative(sourceDir);

  const callback: WatchCallback = async (event) => {
    try {
      if (isWatchAddEvent(event) || isWatchChangeEvent(event)) {
        const {
          data: sourceFilepath,
          sitemap,
        } = event;
        const relativeFilepath = relativeToSource(sourceFilepath);
        if (relativeFilepath === 'docoddity.json') {
        } else {
          sitemap.add(sourceFilepath);
          const filepath = Files.getFilepath(relativeFilepath, {
            sourceDir,
            targetDir,
          });
        }
        await Promise.all([...sitemap].map(file => docoddity.writeFile(docoddity.getFilepath(file))))
      } else if (isWatchDeleteEvent(event)) {
        const {
          data: sourceFilepath,
          sitemap,
        } = event;

        const relativeFilepath = relativeToSource(sourceFilepath);

        if (relativeFilepath === 'docoddity.json') {
        } else {
          sitemap.remove(sourceFilepath);
          await docoddity.removeFile(relativeFilepath);
        }
        await Promise.all([...sitemap].map(file => docoddity.writeFile(docoddity.getFilepath(file))))
      }
    } catch (err) {
      console.error(err);
    }
  };

  const stopWatching = docoddity.watch(callback);

  const vite = await createServer({
    root: targetDir,
    plugins: [
      inlineCSSContent(),
      forwardToTrailingSlashPlugin(targetDir),
    ],
    server: {
      port,
      open,
      fs: {
        allow: [
          sourceDir,
          THEMES,
        ],
      },
    },

    optimizeDeps: {
      include: [],
      exclude: ['@shoelace-style/shoelace/dist/utilities/base-path.js'],
    },
  });

  await vite.listen();

  console.log('[Docoddity] dev server running in port', vite.config.server.port)

  process.on('beforeExit', async () => {
    stopWatching();
    await vite.close();
  });

  // Listen for the SIGTERM signal
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal. Closing Vite server gracefully.');

    // Close the Vite server gracefully
    await vite.close();

    console.log('Vite server closed.');

    // Exit the process
    process.exit(0);
  });
};

