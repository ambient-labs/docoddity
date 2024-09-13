export async function swallowErr<T>(fn: () => Promise<T>, fallback: T) {
  try {
    return await fn();
  } catch (err) { }
  return fallback;
}
