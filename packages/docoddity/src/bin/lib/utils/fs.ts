import path from 'path';
import pkg from 'fs-extra';

export const {
  unlink,
  exists,
  existsSync,
  mkdirp,
} = pkg;

export const writeFile = async (filepath: string, _contents: string | Promise<string>) => {
  const [
    contents,
    _,
  ] = await Promise.all([
    _contents,
    mkdirp(path.dirname(filepath)),
  ]);
  await pkg.writeFile(filepath, contents, 'utf-8');
}

type Encoding = 'utf-8' | 'base64' | 'binary' | 'hex';
export const readFile = (filepath: string, encoding: Encoding = 'utf-8') => pkg.readFile(filepath, encoding);
