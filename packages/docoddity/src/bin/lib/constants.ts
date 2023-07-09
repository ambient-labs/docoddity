import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const docoddity_ROOT = path.resolve(__dirname, "../../../");
export const _INCLUDES = path.resolve(docoddity_ROOT, "src/_includes");
export const THEMES = path.resolve(docoddity_ROOT, "src/themes");
// // export const CONTENT = path.resolve(docoddity_ROOT, "content");
// export const INTERNAL_JS_FOLDER = path.resolve(docoddity_ROOT, "js");
