export const buildPageNodeURL = (parts: string[]) => {
  const lastPart = parts[parts.length - 1].replace(/\.(md|html)$/, '');
  return '/' + [
    ...parts.slice(0, -1),
    lastPart === 'index' ? undefined : lastPart,
  ].join('/');
};
