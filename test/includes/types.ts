export interface DocoddityFile {
  filepath: string;
  content: string | Record<string, unknown> | unknown[];
}
