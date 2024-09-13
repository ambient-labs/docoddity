// import pkg from 'fs-extra';
// const {
//   mkdirp,
//   readFile,
//   writeFile: _writeFile,
// } = pkg;
// import { glob, } from 'glob';

// import path from 'path';
// import { CreateFile, DataFile, FileDefinition, Opts, ProcessedDataFile, ScriptDefinition, StyleDefinition, } from './types.js';
// import { getCreateFile, } from './utils/get-create-file.js';
// import { readdirSync, statSync, } from 'fs';
// // import { buildTSC, transpile, } from './utils/tsc.js';
// import { waitUntilAllFilesWritten, } from './wait-until-all-files-written.js';
// import {
//   getConfigurationFiles,
//   getContentDirectories,
//   getInternalDirectories,
// } from './definitions.js';
// import {
//   createFileWithStandardVariables,
// } from './create-file-with-standard-variables.js';
// import { getdocoddity } from "./get-docoddity.js";
// import { parseDataFile } from "./parse-data-file.js";
// import { writeFile } from './utils/write-file.js';
// import { DOCODDITY_ROOT, THEMES } from './constants.js';
// import { checkDirs } from './check-dirs.js';

// const parseAndWriteDataFile = async (dataFile: DataFile, targetFilename: string, {
//   cwd,
//   inputDir,
//   outDir,
//   inDir,
//   createFile,
// }: {
//   cwd: string;
//   inputDir: string;
//   outDir: string;
//   inDir: string;
//   createFile: CreateFile;
// }) => {
//   const processedDataFile = await parseDataFile(dataFile, {
//     key: targetFilename,
//     inDir,
//     cwd,
//     inputDir,
//     outDir: outDir,
//     createFile,
//   });
//   const targetPath = path.join(outDir, `_data/${targetFilename}.json`);
//   await writeFile(targetPath, JSON.stringify(processedDataFile, null, 2))
// }

// export const main = async ({
//   inputDir,
//   buildDir,
//   internalDir,
//   eleventyCallback,
//   monitorContentDirectories,
// }: {
//   monitorContentDirectories: (createFile: CreateFile, files: FileDefinition[]) => Promise<void>,
//   eleventyCallback: () => Promise<void>;
//   inputDir: string;
//   internalDir: string;
//   buildDir: string;
// }) => {
//   checkDirs({
//     inputDir,
//     buildDir,
//     internalDir,
//   });
//   const createFile = getCreateFile(inputDir);
//   await Promise.all([
//     mkdirp(buildDir),
//     mkdirp(internalDir),
//   ]);

//   const configFiles = getConfigurationFiles(inputDir, internalDir,);
//   await waitUntilAllFilesWritten(configFiles, (file) => createFileWithStandardVariables({ createFile, internalDir, ...file }),);

//   // in docoddity, the user can specify certain files, like scripts and styles
//   // they do _not_ need to care about where those files are placed and referenced.
//   // we will handle that for them.

//   // 1. we parse the docoddity file, and find any specified files for inclusion
//   // 2. we parse the content directory, and find any .md or .html files for inclusion
//   const { theme, ...docoddity } = await getdocoddity(configFiles.docoddity);
//   await parseAndWriteDataFile(docoddity, 'site', {
//     cwd: inputDir,
//     outDir: internalDir,
//     inputDir,
//     createFile,
//     inDir: inputDir,
//   });
//   /** Theme */
//   const themeDir = path.resolve(THEMES, theme);
//   const themeJSON = JSON.parse(await readFile(path.resolve(themeDir, 'theme.json'), 'utf-8'));

//   await parseAndWriteDataFile(themeJSON, 'theme', {
//     cwd: themeDir,
//     inputDir,
//     inDir: themeDir,
//     outDir: internalDir,
//     createFile: getCreateFile(themeDir),
//   });

//   await Promise.all([
//     // For monitoring internal directories
//     ...getInternalDirectories(internalDir),
//   ].map(async ({
//     input,
//     output,
//     transform,
//   }) => {
//     const files = await glob(path.resolve(input, '**/*'));
//     return Promise.all(files.map(async (inputFilepath) => {
//       if (!statSync(inputFilepath).isDirectory()) {
//         const filepath = inputFilepath.split(`${input}/`)[1];
//         const outputFilepath = path.resolve(internalDir, output, filepath);
//         await createFile(inputFilepath, outputFilepath, transform);
//       }
//     }));
//   }));

//   await monitorContentDirectories(
//     createFile,
//     // For monitoring site content
//     getContentDirectories({ inputDir, internalDir, }),
//   );

//   await eleventyCallback();
// }
