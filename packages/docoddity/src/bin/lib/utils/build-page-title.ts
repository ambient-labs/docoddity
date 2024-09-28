export const buildPageTitle = (...titles: (undefined | string)[]) => titles.filter(Boolean).map(stripCode).join(' | ')

const stripCode = (code = '') => code.replace(/`/g, '')
