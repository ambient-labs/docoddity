import type {
  ConfigureDevDocodditySite,
  SetupDev,
} from './types.js';
import { runDocoddityDev } from './run-docoddity-dev.js';
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
    const { runner, dist, cwd, printURL, updateFiles, removeFiles, renameFiles, } = await setupSite(files, key);
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
      renameFiles,
      runner,
      printURL,
      docoddityDevProcess,
      ...getPageFunctionUtils(runner, docoddityDevProcess),
    };
  }

  afterAll(async () => {
    await Promise.all([
      closeAllRunners(),
      closeAllChildProcesses(),
    ]);
  }, 100);

  return configureDocodditySite;
};
