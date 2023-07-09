import path from 'path';
import * as esbuild from 'esbuild';
import { Loader } from 'esbuild';
import {
  WatchStatusReporter,
  type CompilerOptions,
} from "typescript";
import chalk from 'chalk';
import ts from 'typescript';
import { } from 'fs-extra';
import pkg from 'fs-extra';
import { getHashedName } from '../get-hashed-name.js';
const {
  readFile,
} = pkg;
const {
  createWatchCompilerHost,
  createWatchProgram,
  createSemanticDiagnosticsBuilderProgram,
  findConfigFile,
  sys,
  readConfigFile,
  parseJsonConfigFileContent,
} = ts;

const getTSConfig = (dir: string) => {
  const configPath = findConfigFile(
    dir,
    sys.fileExists.bind(sys),
    "tsconfig.json"
  );
  if (configPath) {
    const { config, } = readConfigFile(configPath, sys.readFile.bind(sys)) as {
      config: {
        compilerOptions: CompilerOptions;
        include?: CompilerOptions["include"];
        exclude?: CompilerOptions["exclude"];
        files?: CompilerOptions["files"];
        extends?: CompilerOptions["extends"];
      };
    };
    return config;
  }
  return {};
}

const getTSConfigPath = (dir: string) => {
  const configPath = findConfigFile(
    dir,
    sys.fileExists.bind(sys),
    "tsconfig.json"
  );
  if (configPath) {
    return path.resolve(dir, configPath);
  }
  return undefined;
};

export const transpile = async (filepath: string, inputDir: string) => {
  const outDir = path.join('.docoddity', 'ts-build', getHashedName('user/' + filepath));
  const outfile = path.resolve(outDir, 'tmp.js');
  const tsconfig = getTSConfigPath(inputDir);
  await esbuild.build({
    entryPoints: [filepath],
    bundle: true,
    outfile,
    tsconfig,
  });
  return outfile;
}

export const buildTSC = (src: string, buildDir: string
  // , opts: CompilerOptions = {}
): string => {
  const outDir = path.join('.docoddity', 'ts-build', getHashedName(src));
  const compilerOptions = getTSConfig(buildDir);

  const { options, fileNames, errors, } = parseJsonConfigFileContent({
    ...compilerOptions,
    files: [src],
  }, sys, buildDir);
  const program = ts.createProgram({
    options: {
      ...options,
      outDir: path.resolve(buildDir, outDir),
    },
    rootNames: fileNames,
    configFileParsingDiagnostics: errors,
  });
  // console.log(fileNames);
  const { diagnostics, emitSkipped, } = program.emit();
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(diagnostics, errors);
  // console.log(diagnostics, emitSkipped)
  // console.log(allDiagnostics)
  if (allDiagnostics.length) {
    const formatHost: ts.FormatDiagnosticsHost = {
      getCanonicalFileName: (path) => path,
      getCurrentDirectory: sys.getCurrentDirectory.bind(sys),
      getNewLine: () => sys.newLine,
    };
    const message = ts.formatDiagnostics(allDiagnostics, formatHost);
    console.warn(message);
  }
  if (emitSkipped) {
    process.exit(1);
  };
  return outDir;
};

export class TSCWatcher {
  constructor(watchDir: string, opts: CompilerOptions = {}) {
    const configPath = findConfigFile(
      watchDir,
      sys.fileExists.bind(sys),
      "tsconfig.json"
    );

    if (!configPath) {
      return;
      // throw new Error("Could not find a valid 'tsconfig.json'.");
    }

    const watchStatusReporter: WatchStatusReporter = (diagnostic) => {
      console.log(chalk.cyan`[TS]`, diagnostic.messageText);
    };

    const host = createWatchCompilerHost(
      configPath,
      opts,
      sys,
      createSemanticDiagnosticsBuilderProgram,
      undefined,
      watchStatusReporter,
    );

    createWatchProgram(host);
  }
}

