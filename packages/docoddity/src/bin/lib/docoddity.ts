import type {
  Folders,
  WatchCallback,
  DocoddityFilepath,
  DocoddityRenderedArgs,
} from './types.js';
import { _INCLUDES } from './constants.js';
import { Sitemap } from './sitemap.js';
import { gatherAllSiteFiles } from './utils/gather-all-site-files.js';
import { removeFile } from './utils/remove-file.js';
import { watch } from './watch.js';
import { Files } from './files.js';
import { Markdown } from './markdown/markdown.js';
import { readFile, writeFile } from './utils/fs.js';
import { readDocoddityJSON } from './utils/read-docoddity-json.js';
import { makeRelative } from './utils/make-relative.js';
import { Theme } from './theme.js';
import { buildTagArgs } from './utils/build-tag-args.js';
import { withExt } from './utils/with-ext.js';
import { parseFrontmatter } from './utils/parse-frontmatter.js';
import { renderMarkdownPage } from './templates/render-markdown-page.js';
import { parseTitleFromURL } from './utils/parse-title-from-url.js';
import { renderHTMLPage } from './templates/render-html-page.js';
import { rewriteRelativeLinks } from './utils/rewrite-relative-links.js';
import path from 'path';

export class Docoddity {
  sitemap: Sitemap;
  #markdown?: Markdown;
  #theme?: Theme;
  constructor(public folders: Folders) {
    this.sitemap = new Sitemap(folders.sourceDir);
  }

  initialize = async () => {
    const { markdown, theme } = await readDocoddityJSON(this.folders.sourceDir) || {};
    const enhancerPath = markdown ? path.resolve(this.folders.sourceDir, markdown) : undefined;
    this.#markdown = new Markdown(enhancerPath);
    await this.#markdown.ready;
    this.#theme = new Theme(theme);
  };

  get markdown() {
    if (!this.#markdown) {
      throw new Error('Markdown not initialized; call initialize() first');
    }
    return this.#markdown;
  }

  get theme() {
    if (!this.#theme) {
      throw new Error('Theme not initialized; call initialize() first');
    }
    return this.#theme;
  }

  writeFiles = async () => Promise.all((await gatherAllSiteFiles(this.folders, this.sitemap)).map(this.writeFile));
  // writeFile = (file: DocoddityFilepath) => writeContentPage(this, file);
  writeFile = async ({ sourceFilepath, targetFilepath }: DocoddityFilepath) => {
    const { sourceDir, targetDir, } = this.folders;
    const [content, docoddityContents] = await Promise.all([
      readFile(sourceFilepath),
      await readDocoddityJSON(sourceDir) || {},
    ]);

    const relativeFilepath = makeRelative(targetDir)(targetFilepath);

    const theme = this.theme;
    const pageURL = relativeFilepath.split('.').slice(0, -1).join('.');
    const pages = await this.sitemap.getPages(relativeFilepath);
    const args: DocoddityRenderedArgs = {
      docoddity: await buildTagArgs(docoddityContents, sourceDir),
      theme: await buildTagArgs(await theme.json, theme.dir, {
        'data-file': 'theme',
      }),
      page: {
        url: pageURL,
        pages,
      },
      content,
    }
    if (targetFilepath.endsWith('.md')) {
      const { title, ...fileFrontmatter } = await parseFrontmatter(content);
      const htmlContents = this.markdown.render(content, sourceFilepath);

      if (typeof htmlContents !== 'string') {
        throw new Error(`Error translating ${sourceFilepath}: ${htmlContents}`);
      }
      const targetHTMLFilepath = withExt(targetFilepath, 'html');
      await writeFile(
        targetHTMLFilepath,
        (await renderMarkdownPage({
          ...args,
          ...fileFrontmatter,
          title: title ?? parseTitleFromURL(pageURL) ?? '',
          content: htmlContents,
        })).trim(),
      );
      return targetHTMLFilepath;
    }
    await writeFile(targetFilepath, renderHTMLPage({
      ...args,
      content: rewriteRelativeLinks(await args.content, sourceDir),
    }));
    return targetFilepath;
  };

  watch = (callback: WatchCallback) => watch(this, callback);
  removeFile = (file: string) => removeFile(this.folders, file);

  getFilepath = (filepath: string) => Files.getFilepath(filepath, this.folders);
};
