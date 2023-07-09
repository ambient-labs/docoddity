import { StyleDefinition } from "./types.js";

export const getStyle = (style: string | StyleDefinition): StyleDefinition => {
  if (typeof style === 'string') {
    return {
      href: style,
    }
  }
  return style;
}


