export const buildPageNodeURL = (parts: string[]): string => {
  const lastPart = parts[parts.length - 1].replace(/\.(md|html)$/, '');
  return '/' + [
    ...parts.slice(0, -1),
    lastPart === 'index' ? '' : lastPart,
  ].join('/');
};
