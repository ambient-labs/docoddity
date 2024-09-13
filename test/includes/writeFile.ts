import path from 'path';
import {
  mkdirp,
  writeFile as _writeFile,
} from 'fs-extra';

export const writeFile = async (filepath: string, _contents: string | Promise<string>) => {
  const [
    contents,
    _,
  ] = await Promise.all([
    _contents,
    mkdirp(path.dirname(filepath)),
  ]);
  await _writeFile(filepath, contents, 'utf-8');
}
