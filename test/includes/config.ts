import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))
export const ROOT = path.resolve(__dirname, '../..')
export const DOCODDITY_PACKAGE = path.resolve(ROOT, 'packages/docoddity');
