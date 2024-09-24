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

  const relativeToSource = makeRelative(sourceDir);

  // const writtenFiles = await docoddity.writeFiles();
  // const htmlFiles = writtenFiles.filter((file) => file.endsWith('.html'));
  const callback: WatchCallback = async (event) => {
    if (isWatchAddEvent(event) || isWatchChangeEvent(event)) {
      const {
        data: sourceFilepath,
        sitemap,
      } = event;
      const relativeFilepath = relativeToSource(sourceFilepath);
      if (relativeFilepath === 'docoddity.json') {
        // const docoddityContents = await readDocoddityJSON(sourceDir);
        // await Promise.all([...sitemap].map(file => docoddity.writeFile(docoddity.getFilepath(file))))
      } else {
        sitemap.add(sourceFilepath);
        const filepath = Files.getFilepath(relativeFilepath, {
          sourceDir,
          targetDir,
        });
        // sitemap.add(file);
        await docoddity.writeFile(filepath);
      }
      await Promise.all([...sitemap].map(file => docoddity.writeFile(docoddity.getFilepath(file))))
    } else if (isWatchDeleteEvent(event)) {
      const {
        data: sourceFilepath,
        sitemap,
      } = event;

      const relativeFilepath = relativeToSource(sourceFilepath);

      if (relativeFilepath === 'docoddity.json') {
        // const docoddityContents = await readDocoddityJSON(sourceDir);
        // await Promise.all([...sitemap].map(file => docoddity.writeFile(docoddity.getFilepath(file))))
      } else {
        sitemap.remove(sourceFilepath);
        console.log('ok, remove this file', relativeFilepath)
        await docoddity.removeFile(relativeFilepath);
        // sitemap.add(file);
        // await docoddity.writeFile(filepath);
      }
      // await docoddity.removeFile(event.data)
      await Promise.all([...sitemap].map(file => docoddity.writeFile(docoddity.getFilepath(file))))
    }
  };

  const stopWatching = docoddity.watch(callback);

  const vite = await createServer({
    root: targetDir,
    plugins: [inlineCSSContent()],
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

