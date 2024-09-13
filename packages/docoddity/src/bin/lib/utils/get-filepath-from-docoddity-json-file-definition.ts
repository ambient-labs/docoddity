import {
  type DocoddityFileDefinition
} from "../types.js";

export const getFilepathFromDocoddityJSONFileDefinition = (file: string | DocoddityFileDefinition): string | undefined => {
  if (typeof file === 'string') {
    return file;
  } else {
    const fileSrc = file.src || file.href;
    if (fileSrc && typeof fileSrc === 'string') {
      return fileSrc;
    }
  }
  return undefined;
}
