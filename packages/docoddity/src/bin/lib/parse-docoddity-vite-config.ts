import path from 'path';
import { DocoddityViteConfigArgs } from './types.js';

export const parseDocoddityViteConfig = async (
  viteConfig: string | undefined,
  args: DocoddityViteConfigArgs & Record<string, unknown>
) => {
  if (!viteConfig) {
    return {};
  }
  const additionalConfig = (await import(path.resolve(viteConfig))).default;
  return typeof additionalConfig === 'function' ? await additionalConfig(args) : additionalConfig;
};
