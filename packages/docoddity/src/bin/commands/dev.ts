import { Command, } from "commander";
import {
  dev,
} from "../lib/dev.js";

export const registerScript = (program: Command) => program.command('dev')
  .description('Run Docoddity Dev Server')
  .option('-p, --port <number>', 'Port')
  .option('-o, --open', 'Open site', false)
  .option('-s, --sourceDir <string>', 'Input directory', './')

  .action(dev);
