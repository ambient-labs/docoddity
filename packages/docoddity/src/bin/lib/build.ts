import {
  Eleventy,
} from "@11ty/eleventy";
import { Opts, } from './types.js';
import path from 'path';
import { main } from "./main.js";

export const build = async ({
  input: inputDir,
  output: buildDir,
  // contentDir,
  internalDir,
}: Opts) => {
  for (const { name, dir, } of [
    { name: 'input', dir: inputDir, },
    { name: 'output', dir: buildDir, },
    // { name: 'content', dir: contentDir, },
    { name: 'site', dir: internalDir, },
  ]) {
    if (!dir) {
      throw new Error(`No ${name} specified`);
    }
  }
  await main({
    buildDir,
    internalDir,
    inputDir,
    // contentDir,
    eleventyCallback: async () => {
      const configPath = path.resolve(internalDir, 'eleventy.config.cjs');
      const elev = new Eleventy(internalDir, buildDir, {
        source: "cli",
        runMode: 'serve',
        quietMode: false,
        configPath: configPath,
      });

      await elev.init();

      await elev.write();
    }
  });



  // TODO: Remove this
  process.exit(0);
};

