export const isLocalFile = (file: string) => !file.startsWith('http') && !file.startsWith('<');
