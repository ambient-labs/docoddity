import type {
  CreateFile,
  TransformFn,
} from "./types.js";
import path from 'path';
import Mustache from 'mustache';

export const createFileWithStandardVariables = async ({
  createFile,
  input,
  output,
  internalDir,
  devMode,
  transform,
}: {
  createFile: CreateFile,
  input: string,
  output: string,
  internalDir: string,
  devMode?: boolean,
  transform?: TransformFn,
}) => createFile(input, output, async contents => {
  const renderedContent = Mustache.render(contents, {
    STYLES_FOLDER: path.join(internalDir, 'styles'),
    JS_FOLDER: path.join(internalDir, 'scripts'),
    // USER_STYLES_FOLDER: path.join(internalDir, 'styles'),
    // USER_JS_FOLDER: path.join(internalDir, 'js'),
    // INTERNAL_JS_FOLDER: path.join(internalDir, '_internal_js'),
    DEV_MODE: devMode ? '1' : '0',
  });
  return transform ? await transform(renderedContent, input) : renderedContent;
});
