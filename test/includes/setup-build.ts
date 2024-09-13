import type {
  ConfigureBuildDocodditySite,
  SetupBuild
} from './types.js';
import { setupRunners, } from './runner.js';
import { runDocoddityBuild } from './run-docoddity-build.js';
import { getPrintURL } from './get-print-url.js';
import { setupSite } from './setup-site.js';

export const setupBuild: SetupBuild = ({
  std: stdOne,
} = {}) => {
  const { closeAllRunners, registerRunner, } = setupRunners();
  const configureDocodditySite: ConfigureBuildDocodditySite = async (files, {
    std: stdTwo,
  } = {}) => {
    try {
      const { runner, dist, buildDir, cwd, updateFiles, } = await setupSite(files);
      registerRunner(dist, runner);
      await runDocoddityBuild(buildDir, cwd, {
        ...stdOne,
        ...stdTwo,
      });
      await runner.startServer();
      return {
        runner,
        printURL: getPrintURL(files, runner),
        updateFiles
      };
    } catch (err) {
      console.error('Error setting up test:', err);
      throw err;
    }
  };

  afterAll(closeAllRunners, 100);

  return configureDocodditySite;
};
