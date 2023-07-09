import { ScriptDefinition } from "./types.js";

export const getScript = (script: string | ScriptDefinition): ScriptDefinition => {
  if (typeof script === 'string') {
    return {
      src: script,
    }
  }
  return script;
}

