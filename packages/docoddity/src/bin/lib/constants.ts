import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const DOCODDITY_ROOT = path.resolve(__dirname, "../../../");
export const _INCLUDES = path.resolve(DOCODDITY_ROOT, "src/_includes");
export const THEMES = path.resolve(DOCODDITY_ROOT, "src/themes");
