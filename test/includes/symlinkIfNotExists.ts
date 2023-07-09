import {
  symlink,
} from 'fs-extra';


import { ifNotExists } from "./ifNotExists.js";

export const symlinkIfNotExists = async (src: string, target: string) => ifNotExists(target, async () => symlink(src, target));
