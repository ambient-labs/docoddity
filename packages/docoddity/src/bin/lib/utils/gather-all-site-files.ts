import path from 'path';
import type {
  DocoddityFilepath,
  Folders
} from '../types.js';
import { Files } from '../files.js';
import {
  type Sitemap
} from '../sitemap.js';
import { glob } from 'glob';

export const gatherAllSiteFiles = async ({
  sourceDir,
  targetDir,
}: Folders,
  sitemap: Sitemap): Promise<DocoddityFilepath[]> => {
  const userFiles = new Files(sourceDir, targetDir);
  for (const file of await glob(
    path.resolve(sourceDir, '**/*.{md,html}'),
    {
      ignore: [
        'node_modules/**',
        `${targetDir}/**`,
      ],
    },
  )) {
    sitemap.add(file);
    userFiles.add(file);
  }
  // const docoddityPath = path.resolve(sourceDir, 'docoddity.json');

  // let docoddityContents = {};
  // if (await exists(docoddityPath)) {
  //   userFiles.add(docoddityPath);
  //   docoddityContents = await readDocoddityJSON(sourceDir);

  //   for await (const file of getDocoddityContents(sourceDir, docoddityContents)) {
  //     userFiles.add(file);
  //   }
  // }

  // const theme = new Theme(docoddityContents);
  // const [themeDir, themeContents] = await Promise.all([theme.dir, theme.json]);
  // const themeFiles = new Files(themeDir, theme.getTargetDir(targetDir));
  // for await (const file of getDocoddityContents(themeDir, themeContents)) {
  //   themeFiles.add(file);
  // }

  return [
    ...userFiles,
    // ...themeFiles,
  ];
}
