export const getIsActive = (url: string, pageUrl: string = '') => {
  if (url === '/') {
    return pageUrl === url;
  }
  return parseURL(pageUrl) === parseURL(url);
}

const parseURL = (url: string) => {
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  const slicedParts = lastPart === 'index' ? parts.slice(0, -1) : parts;
  return slicedParts.filter(Boolean).join('/');
}