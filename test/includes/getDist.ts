import path from 'path';
import { getCwd } from "./getCwd.js";
// import { DocoddityTestFile } from "./types.js";

export const getDist = (buildDir: string) => {
  const cwd = getCwd();
  return path.resolve(cwd, path.resolve(cwd, buildDir));
};
