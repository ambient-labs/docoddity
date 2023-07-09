import { transpile, } from './utils/tsc.js';
import path from 'path';
import type {
  CreateFile,
  DataFile,
  ProcessedDataFile,
  ScriptDefinition,
  StyleDefinition,
} from "./types.js";
import { getHashedName } from "./get-hashed-name.js";
import { getScript } from "./get-script.js";
import { getStyle } from "./get-style.js";
import { transformTags } from './transform-tags.js';

async function parseElementsFromDataFile<D extends { src: string }, O>({
  data,
  createFile,
  getOutSrc,
  returnObj,
  key,
}: {
  data: D[],
  createFile: (inSrc: string, outSrc: string) => Promise<void>,
  getOutSrc: (inSrc: string) => string,
  returnObj: (obj: Omit<D, 'src'>, src: string, origSrc: string) => O,
  key: string,
}): Promise<O[]> {
  // console.log('parse elements from data file', data)
  return await Promise.all(data.map(async ({ src, ...rest }) => {
    // console.log('src', src, rest);
    if (!src.startsWith('http')) {
      const hashedName = getHashedName([key, src].join('/'));
      const outSrc = getOutSrc(hashedName);
      await createFile(src, outSrc);
      return returnObj(rest, `/${outSrc}`, src);
    }

    return returnObj(rest, src, src);
  }));
};

export const parseDataFile = async ({
  headTags: _headTags = [],
  scripts: _scripts = [],
  styles: _styles = [],
}: DataFile, {
  key,
  cwd,
  inputDir,
  outDir,
  createFile,
  inDir,
}: {
  key: string;
  cwd: string;
  inputDir: string;
  inDir: string;
  outDir: string;
  createFile: CreateFile,
}): Promise<ProcessedDataFile> => {
  const scripts = await parseElementsFromDataFile({
    data: _scripts.map(getScript),
    createFile: async (inSrc: string, outSrc: string) => {
      const src = inSrc.endsWith('.ts') ? await transpile(path.resolve(inDir, inSrc), inputDir) : inSrc;
      const targetPath = path.resolve(outDir, outSrc);
      await createFile(src, targetPath);
    },
    getOutSrc: (hashedName: string) => path.join('scripts', `${hashedName}.js`),
    key,
    returnObj: (script, src, origSrc) => stringify<ScriptDefinition>({
      ...script,
      'orig-src': origSrc,
      src,
      'data-file': key,
      // src: src.startsWith('http') || src.startsWith('/') ? src : `/${src}`,
    }),
  });
  const styles = await parseElementsFromDataFile({
    data: _styles.map(getStyle).map(({ href, ...style }) => ({
      ...style,
      src: href,
    })),
    createFile: async (src: string, outSrc: string) => {
      const targetPath = path.resolve(outDir, outSrc);
      await createFile(src, targetPath);
    },
    getOutSrc: (hashedName: string) => path.join('styles', `${hashedName}.css`),
    key,
    returnObj: (style, src, origSrc) => stringify<StyleDefinition>({
      ...style,
      href: src,
      // href: src.startsWith('http') || src.startsWith('/') ? src : `/${src}`,
      'orig-src': origSrc,
      'data-file': key,
    }),
  });
  const [headTags] = await Promise.all([
    transformTags(_headTags, cwd),
  ]);

  return {
    scripts,
    styles,
    headTags,
  };
};

function stringify<T>(obj: Record<string, unknown>): T {
  return Object.entries(obj).reduce((obj, [key, value]) => ({
    ...obj,
    [key]: typeof value === 'string' ? JSON.stringify(value) : value,
  }), {} as T);
};
