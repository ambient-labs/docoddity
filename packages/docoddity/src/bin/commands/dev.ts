import { Command, } from "commander";
import {
  dev,
} from "../lib/dev.js";

export const registerScript = (program: Command) => program.command('dev')
  .description('Run Docoddity Dev Server')
  .option('-p, --port <number>', 'Port')
  .option('-o, --open', 'Open site', false)
  .option('-b, --buildDir <string>', 'Internal build directory')
  .option('-s, --sourceDir <string>', 'Input directory', './')
  .option('-v, --viteConfig <string>', 'Optional vite config')

  .action(dev);
