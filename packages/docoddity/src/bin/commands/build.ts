import { Command, } from "commander";
import {
  build,
} from "../lib/build.js";

export const registerScript = (program: Command) => program.command('build')
  .description('Build Docoddity Site')
  .option('-s, --sourceDir <string>', 'Input directory', './')
  .option('-b, --buildDir <string>', 'Internal build directory')
  .option('-t, --targetDir <string>', 'Output directory', './build')
  .action(build);
