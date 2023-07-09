import {
  exists,
} from 'fs-extra';

export const ifNotExists = async (path: string, fn: () => Promise<void>) => {
  if (!(await exists(path))) {
    return fn();
  }
};
