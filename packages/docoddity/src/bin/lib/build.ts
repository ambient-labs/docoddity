import type {
  SharedCLIArgs,
} from './types.js';
import {
  mkdirp,
} from './utils/fs.js';
import { Docoddity } from './docoddity.js';
import path from 'node:path';
import { mergeConfig, build as viteBuild } from 'vite';
import { inlineCSSContent } from './inline-css-content.js';
import { getBuildDir } from './utils/get-build-dir.js';

export const build = async ({
  sourceDir: _sourceDir,
  targetDir: _targetDir,
  buildDir: _buildDir,
  viteConfig,
}: SharedCLIArgs) => {
  const sourceDir = path.resolve(_sourceDir);
  const targetDir = path.resolve(_targetDir);
  const buildDir = _buildDir || getBuildDir();

  await Promise.all([
    mkdirp(buildDir),
    mkdirp(targetDir),
  ]);
  const docoddity = new Docoddity({
    sourceDir: sourceDir,
    targetDir: buildDir,
  });
  await docoddity.initialize();
  const writtenFiles = await docoddity.writeFiles();
  const htmlFiles = writtenFiles.filter((file) => file.endsWith('.html'));

  const additionalConfig = viteConfig ? await import(viteConfig) : {};

  await viteBuild(mergeConfig({
    root: buildDir,
    plugins: [
      inlineCSSContent(),
    ],
    optimizeDeps: {
      include: [],
    },
    worker: {
      format: 'es',
    },
    build: {
      outDir: targetDir,
      emptyOutDir: true,
      rollupOptions: {
        input: htmlFiles,
        external: [
          // '@shoelace-style/shoelace/dist/utilities/base-path.js',
        ],
      },
    },
  }, additionalConfig));
};
