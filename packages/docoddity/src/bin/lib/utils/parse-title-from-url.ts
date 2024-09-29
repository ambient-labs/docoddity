export const parseTitleFromURL = (url: string) => {
  const pageTitle = url.split('/').pop() || '';
  const formattedTitle = pageTitle.split(/[-_]/g).map(uppercaseFirstChar).filter(Boolean).join(' ');
  return formattedTitle;
};

const uppercaseFirstChar = (str?: string) => str ? str[0].toUpperCase() + str.slice(1) : '';
