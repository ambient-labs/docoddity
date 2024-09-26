import { buildTagArgs } from "./build-tag-args.js";
import {
  readFile,
  writeFile
} from "./fs.js";
import { getMarkdown } from "./get-markdown.js";
import { makeRelative } from "./make-relative.js";
import { parseFrontmatter } from "./parse-frontmatter.js";
import { readDocoddityJSON } from "./read-docoddity-json.js";
import type { Sitemap } from "../sitemap.js";
import { swallowErr } from "./swallow-err.js";
import { renderBase } from "../templates/render-base.js";
import { renderPage } from "../templates/render-page.js";
import { Theme } from "../theme.js";
import type {
  DocoddityContents,
  DocoddityRenderedArgs,
  Folders,
  DocoddityFilepath
} from "../types.js";
import { withExt } from "./with-ext.js";
import { rewriteRelativeLinks } from "./rewrite-relative-links.js";
import { parseTitleFromURL } from "./parse-title-from-url.js";

export const writeContentPage = async (
  { sourceDir, targetDir, }: Folders,
  { sourceFilepath, targetFilepath }: DocoddityFilepath,
  sitemap: Sitemap,
) => {
  const [content, docoddityContents] = await Promise.all([
    readFile(sourceFilepath),
    swallowErr<DocoddityContents>(() => readDocoddityJSON(sourceDir), {}),
  ]);

  const relativeFilepath = makeRelative(targetDir)(targetFilepath);

  const theme = new Theme(docoddityContents);
  const pageURL = relativeFilepath.split('.').slice(0, -1).join('.');
  const args: DocoddityRenderedArgs = {
    docoddity: await buildTagArgs(docoddityContents, sourceDir),
    theme: await buildTagArgs(await theme.json, theme.dir, {
      'data-file': 'theme',
    }),
    page: {
      url: pageURL,
      pages: await sitemap.getPages(relativeFilepath),
    },
    content,
  }
  if (targetFilepath.endsWith('.md')) {
    const { title, ...fileFrontmatter } = parseFrontmatter(content);
    const htmlContents = await getMarkdown(content);

    if (typeof htmlContents !== 'string') {
      throw new Error(`Error translating ${sourceFilepath}: ${htmlContents}`);
    }
    const targetHTMLFilepath = withExt(targetFilepath, 'html');
    await writeFile(
      targetHTMLFilepath,
      renderPage({
        ...args,
        ...fileFrontmatter,
        title: title ?? parseTitleFromURL(pageURL) ?? '',
        content: htmlContents,
      }).trim(),
    );
    return targetHTMLFilepath;
  }
  await writeFile(targetFilepath, renderBase({
    ...args,
    content: rewriteRelativeLinks(args.content, sourceDir),
  }).trim());
  return targetFilepath;
}


