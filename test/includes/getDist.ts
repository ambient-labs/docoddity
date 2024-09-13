import path from 'path';
import { getCwd } from "./getCwd.js";
import { DocoddityTestFile } from "./types.js";

export const getDist = async (files: DocoddityTestFile[], buildDir: string) => {
  const cwd = await getCwd(files);
  return path.resolve(cwd, path.resolve(cwd, buildDir));
};
