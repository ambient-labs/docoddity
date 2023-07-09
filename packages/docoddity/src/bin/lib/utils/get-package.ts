import path from 'path';
import pkg from 'fs-extra';
const {
  readFileSync,
} = pkg;

export const getPackageJSON = (inputDir: string) => {
  const contents = readFileSync(path.resolve(inputDir, 'package.json'), 'utf-8');
  const packageJSON = JSON.parse(contents) as {
    dependencies: Record<string, string>;
  };
  return packageJSON;
};
