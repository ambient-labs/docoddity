import type { Runner } from "./runner.js";

export const getElementTransformStyle = (runner: Runner, selector: string) => runner.page.evaluate((selector) => {
  // Get the computed transform property
  const transformString = window.getComputedStyle(document.querySelector(selector)).getPropertyValue('transform');

  let x = 0;
  let y = 0;
  let z = 0;

  if (transformString.startsWith('matrix3d')) {
    // Extract the values from the matrix3d string
    const values = transformString.match(/matrix3d\((.+)\)/)[1].split(', ').map(parseFloat);

    // In a matrix3d, translateX, translateY, and translateZ are at indices 13, 14, and 15 respectively
    x = values[12];
    y = values[13];
    z = values[14];
  } else if (transformString.startsWith('matrix')) {
    // Extract the values from the matrix string
    const values = transformString.match(/matrix\((.+)\)/)[1].split(', ').map(parseFloat);

    // In a 2D matrix, translateX and translateY are at indices 4 and 5 respectively
    x = values[4];
    y = values[5];
    z = 0;  // In 2D transformations, there's no translateZ
  }

  return { x, y, z };
}, selector);
