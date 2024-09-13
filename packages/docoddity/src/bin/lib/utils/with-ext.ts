export const withExt = (filepath: string, ext: string) => [...filepath.split('.').slice(0, -1), ext].join('.');

