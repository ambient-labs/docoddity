export const setupMap = <T>() => {
  const map = new Map<string, T>();
  type Callback = (el: T) => (Promise<void> | void);
  type ErrorCallback = (err: unknown, el: T, key: string) => void;
  return {
    register: (key: string, el: T) => {
      map.set(key, el)
    },
    closeAll: async (callback: Callback, errorCallback?: ErrorCallback) => {
      await Promise.all([
        Array.from(map).map(async ([key, el]) => {
          try {
            await callback(el);
            map.delete(key);
          } catch (err) {
            errorCallback ? errorCallback(err, el, key) : console.error('error calling callback with el:', el);
          }
        }),
      ])
    },
  };
}
