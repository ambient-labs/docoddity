export const $ = (selector: string): Omit<HTMLElement, 'closest'> & {
  closest: (selector: string) => HTMLElement;
} => {
  const el = document.querySelector(selector);
  if (!el) {
    throw new Error(`No element found for ${selector}`);
  }
  if (!(el instanceof HTMLElement)) {
    throw new Error(`Element is not an HTMLElement: ${el}`);
  }
  console.log('el', el);
  return {
    ...el,
    closest: (selector: string) => {
      const closest = el.closest(selector);
      if (!(closest instanceof HTMLElement)) {
        throw new Error(`No closest element found for ${selector}`);
      }
      return closest;
    }
  };
}

export const $_ = (selector: string): HTMLElement | null => {
  try {
    return $(selector);
  } catch (err) {
  }
  return null;
};
