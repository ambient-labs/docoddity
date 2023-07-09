import type {
  getCreateFile,
} from "./utils/get-create-file.js";

export interface Opts {
  input: string;
  // contentDir: string;
  internalDir: string;
  output: string;
}

export type CreateFile = ReturnType<typeof getCreateFile>;

export interface FileDefinition {
  input: string;
  output: string;
  required?: boolean;
  transform?: TransformFn;
}

export interface ScriptDefinition {
  src: string;
}

export interface StyleDefinition {
  href: string;
}

export type TransformFn = (contents: string, inputPath: string) => (Promise<string> | string);

export interface DataFile {
  scripts?: (string | ScriptDefinition)[];
  styles?: (string | StyleDefinition)[];
  headTags?: HeadTag[];
}

export interface docoddityDataFile extends DataFile {
  theme?: string;
}

export type HeadTag = Record<string, unknown>;

export interface ProcessedDataFile {
  scripts: ScriptDefinition[];
  styles: StyleDefinition[];
  headTags: HeadTag[];
}
