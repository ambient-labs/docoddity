import type {
  ConfigureDevDocodditySite,
  SetupDev,
} from './types.js';
import { runDocoddityDev } from './run-docoddity-dev.js';
import { getPrintURL } from './get-print-url.js';
import { setupSite } from './setup-site.js';
import { getPageFunctionUtils } from './get-page-function-utils.js';
import { setupRunners, } from './runner.js';
import { setupChildProcesses } from './setup-child-processes.js';
import { rimraf } from 'rimraf';

export const setupDev: SetupDev = ({
  std: stdOne,
} = {}) => {
  const { closeAllRunners, registerRunner, } = setupRunners();
  const { closeAllChildProcesses, registerChildProcess, } = setupChildProcesses();
  const configureDocodditySite: ConfigureDevDocodditySite = async (files, {
    key,
    std: stdTwo,
  } = {}) => {
    try {
      const { runner, dist, cwd, updateFiles, removeFiles } = await setupSite(files, key);
      const {
        child: docoddityDevProcess,
        port,
      } = await runDocoddityDev(cwd, {
        ...stdOne,
        ...stdTwo
      });
      registerRunner(dist, runner);
      registerChildProcess(dist, docoddityDevProcess);
      await runner.setPort(port);
      return {
        updateFiles,
        removeFiles,
        runner,
        printURL: getPrintURL(files, runner),
        docoddityDevProcess,
        ...getPageFunctionUtils(runner, docoddityDevProcess),
      };
    } catch (err) {
      console.error('Error setting up test:', err);
      throw err;
    }
  }

  afterAll(async () => {
    await Promise.all([
      closeAllRunners(),
      closeAllChildProcesses(),
    ]);
  }, 100);

  return configureDocodditySite;
};
