import path from 'path';
import { makeRelative } from "./utils/make-relative.js";

export class Files implements Iterable<{ sourceFilepath: string; targetFilepath: string }> {
  #files: Set<string> = new Set();
  relativeTo: (file: string) => string;
  prependedPath?: string;

  constructor(private sourceDir: string, private targetDir: string) {
    this.relativeTo = makeRelative(sourceDir);
  }

  public add(file: string) {
    this.#files.add(file);
  }

  public *[Symbol.iterator]() {
    for (const file of this.#files) {
      const relativeFilePath = this.relativeTo(file);
      yield Files.getFilepath(relativeFilePath, {
        sourceDir: this.sourceDir,
        targetDir: this.targetDir,
      });
    }
  }

  static getFilepath = (relativeFilepath: string, {
    sourceDir,
    targetDir,
  }: {
    sourceDir: string;
    targetDir: string;
  }) => ({
    sourceFilepath: path.resolve(sourceDir, relativeFilepath),
    targetFilepath: path.resolve(targetDir, relativeFilepath),
  })
}
