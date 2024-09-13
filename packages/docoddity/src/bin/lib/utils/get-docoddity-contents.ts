import path from 'path';
import {
  getFilepathFromDocoddityJSONFileDefinition
} from "./get-filepath-from-docoddity-json-file-definition.js";
import type {
  DocoddityContents
} from "../types.js";
import {
  exists,
} from './fs.js';
import {
  isLocalFile
} from './is-local-file.js';

export async function* getDocoddityContents(rootDir: string, { head = [], body = [] }: DocoddityContents): AsyncGenerator<string, void, unknown> {
  for (const arr of [head, body]) {
    for (const file of arr) {
      const filepath = getFilepathFromDocoddityJSONFileDefinition(file);
      if (filepath) {
        if (isLocalFile(filepath)) {
          const absoluteFilepath = path.resolve(rootDir, filepath);
          if (!(await exists(absoluteFilepath))) {
            throw new Error(`File ${absoluteFilepath} does not exist`);
          }
          yield absoluteFilepath;
        }
      }
    }
  }
}
