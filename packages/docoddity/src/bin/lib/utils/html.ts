type Value = undefined | string | string[] | Promise<string> | Promise<string>[];
export const html = async (strings: TemplateStringsArray, ...values: Value[]): Promise<string> => {
  const resolvedValues = await Promise.all(values.map(val => Array.isArray(val) ? Promise.all(val) : val));
  return strings.reduce((acc, string, i) => {
    const resolvedValue = resolvedValues[i] || '';
    return acc + string + ([] as string[]).concat(resolvedValue).join('');
  }, '');
};

