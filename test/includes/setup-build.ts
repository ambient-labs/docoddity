import type {
  ConfigureBuildDocodditySite,
  SetupBuild
} from './types.js';
import { setupRunners, } from './runner.js';
import { runDocoddityBuild } from './run-docoddity-build.js';
import { setupSite } from './setup-site.js';
import { getPageFunctionUtils } from './get-page-function-utils.js';

export const setupBuild: SetupBuild = ({
  std: stdOne,
} = {}) => {
  const { closeAllRunners, registerRunner, } = setupRunners();
  const configureDocodditySite: ConfigureBuildDocodditySite = async (files, {
    std: stdTwo,
  } = {}) => {
    const { runner, dist, buildDir, cwd, ...rest } = await setupSite(files);
    registerRunner(dist, runner);
    await runDocoddityBuild(buildDir, cwd, {
      ...stdOne,
      ...stdTwo,
    });
    await runner.startServer();
    return {
      runner,
      ...rest,
      ...getPageFunctionUtils(runner),
    };
  };

  afterAll(closeAllRunners, 100);

  return configureDocodditySite;
};
