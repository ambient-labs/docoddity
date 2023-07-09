import path from 'path';
import { getCwd } from "./getCwd.js";
import { DocoddityFile } from "./types.js";

export const getDist = async (files: DocoddityFile[]) => {
  const cwd = await getCwd(files);
  const buildDir = path.resolve(cwd, '.build');
  return path.resolve(cwd, buildDir);
};
