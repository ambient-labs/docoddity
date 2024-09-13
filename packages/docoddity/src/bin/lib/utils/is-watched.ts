import {
  type FSWatcher
} from 'chokidar';

export const isWatched = (watcher: FSWatcher, filepath: string) => {
  const watched = watcher.getWatched();
  return Object.keys(watched).some((dir) => {
    const splitFilepath = filepath.split(`${dir}/`).pop();
    if (splitFilepath) {
      return watched[dir].includes(splitFilepath);
    }
    return false;
  });
};
