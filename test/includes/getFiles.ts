import { DocoddityFile } from "./types.js";

const DEFAULT_PACKAGE_JSON = {
  "name": "docs",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "docoddity start",
    "build": "docoddity build --output ./build"
  },
  "devDependencies": {
    "docoddity": "workspace:*"
  }
};

export const getFiles = (files: DocoddityFile[]): DocoddityFile[] => {
  let hasPackageJSON = false;
  for (const file of files) {
    if (file.filepath === 'package.json') {
      hasPackageJSON = true;
      break;
    }
  }

  if (hasPackageJSON) {
    return files;
  }

  return [
    ...files,
    {
      filepath: 'package.json',
      content: JSON.stringify(DEFAULT_PACKAGE_JSON, null, 2),
    },
  ];
};

