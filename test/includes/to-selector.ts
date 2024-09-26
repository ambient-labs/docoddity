
export const toSelector = ({ tag = '*', ...obj }: Record<string, unknown>, mapping: Record<string, string> = {}) => {
  const selectorAttbs = Object.entries(obj).map(([key, value]) => {
    if (key in mapping) {
      return `[${mapping[key]}="${value}"]`;
    }
    return `[${key}="${value}"]`;
  }).join('');
  return `${tag}${selectorAttbs}`;
}
