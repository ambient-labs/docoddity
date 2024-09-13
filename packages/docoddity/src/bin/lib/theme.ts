import path from 'path';
import { THEMES } from './constants.js';
import {
  readFile,
} from './utils/fs.js';
import {
  type DocoddityContents,
} from './types.js';
import { swallowErr } from './utils/swallow-err.js';

export class Theme {
  theme: string;
  #json?: Promise<DocoddityContents>;

  constructor({ theme = 'default' }: DocoddityContents = {}) {
    this.theme = theme;
  }

  public get source() {
    return path.resolve(THEMES, this.theme);
  }

  public get target() {
    return path.join('theme', this.theme)
  }

  public get dir() {
    return path.resolve(THEMES, this.theme);
  }

  public getTargetDir(targetDir: string) {
    return path.resolve(targetDir, this.target);
  }

  public get json(): Promise<DocoddityContents> {
    if (!this.#json) {
      this.#json = swallowErr(async () => JSON.parse(
        await readFile(path.resolve(this.dir, 'theme.json'))
      ), {});
    }
    return this.#json;
  }
}
