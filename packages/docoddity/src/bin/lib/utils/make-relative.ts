import path from 'path';

export type MakeRelative = (rootDir: string) => (file: string) => string;

export const makeRelative: MakeRelative = (rootDir: string) => {
  const dirPath = `${path.resolve(rootDir).split('/').filter(Boolean).join('/')}/`;
  return (file: string): string => {
    if (!file.includes(dirPath)) {
      throw new Error(`Error: ${file} is not in ${dirPath}`);
    }
    const relativeFilePart = file.split(dirPath).pop();
    if (!relativeFilePart) {
      throw new Error(`Error: ${file} is not in ${dirPath}`);
    }
    return relativeFilePart;
  };
};
