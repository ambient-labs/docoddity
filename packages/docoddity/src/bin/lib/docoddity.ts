import type {
  Folders,
  WatchCallback,
  DocoddityFilepath,
  MarkdownEnhancerFn,
} from './types.js';
import path from 'path';
import { _INCLUDES } from './constants.js';
import { Sitemap } from './sitemap.js';
import { gatherAllSiteFiles } from './utils/gather-all-site-files.js';
// import { isContentPage } from './utils/is-content-page.ts.bl';
import { removeFile } from './utils/remove-file.js';
// import { writeAssetFile } from './utils/write-asset-file.ts.bk';
import { writeContentPage } from './utils/write-content-page.js';
import { watch } from './watch.js';
import { Files } from './files.js';
import { applyMarkdownEnhancer } from './utils/get-markdown.js';

export class Docoddity {
  sitemap: Sitemap;
  constructor(public folders: Folders) {
    this.sitemap = new Sitemap(folders.sourceDir);
    applyMarkdownEnhancer(folders.sourceDir);
  }

  writeFiles = async () => Promise.all((await gatherAllSiteFiles(this.folders, this.sitemap)).map(this.writeFile));
  writeFile = (file: DocoddityFilepath) => writeContentPage(this.folders, file, this.sitemap);

  watch = (callback: WatchCallback) => watch(this, callback);
  removeFile = (file: string) => removeFile(this.folders, file);

  getFilepath = (filepath: string) => Files.getFilepath(filepath, this.folders);
};
