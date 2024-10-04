import type Token from 'markdown-it/lib/token.mjs';

export const getHref = (token: Token) => {
  const href = token.attrs?.find(attr => attr[0] === 'href');
  return href ? href[1] : '';
}
