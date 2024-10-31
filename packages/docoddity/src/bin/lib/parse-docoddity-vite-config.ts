import path from 'path';

interface ParseDocoddityViteConfigArgs {
  sourceDir: string;
  targetDir: string;
}

export const parseDocoddityViteConfig = async (
  viteConfig: string | undefined,
  args: ParseDocoddityViteConfigArgs & Record<string, unknown>
) => {
  if (!viteConfig) {
    return {};
  }
  const additionalConfig = (await import(path.resolve(viteConfig))).default;
  return typeof additionalConfig === 'function' ? await additionalConfig(args) : additionalConfig;
};
