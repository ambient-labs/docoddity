import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const CODE_ROOT = path.resolve(__dirname, "../../");
// export const DOCODDITY_ROOT = path.resolve(__dirname, "../../../");
export const _INCLUDES = path.resolve(CODE_ROOT, "_includes");
export const THEMES = path.resolve(CODE_ROOT, "themes");
