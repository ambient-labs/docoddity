import type {
  ConfigureDevDocodditySite,
  SetupDev,
} from './types.js';
import { runDocoddityDev } from './run-docoddity-dev.js';
import { setupSite } from './setup-site.js';
import { getPageFunctionUtils } from './get-page-function-utils.js';
import { setupRunners, } from './runner.js';
import { setupChildProcesses } from './setup-child-processes.js';

export const setupDev: SetupDev = ({
  std: stdOne,
} = {}) => {
  const { closeAllRunners, registerRunner, } = setupRunners();
  const { closeAllChildProcesses, registerChildProcess, } = setupChildProcesses();
  const configureDocodditySite: ConfigureDevDocodditySite = async (files, {
    std: stdTwo,
  } = {}) => {
    const { runner, dist, cwd, printURL, ...rest } = await setupSite(files);
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
    const response = {
      ...rest,
      runner,
      printURL,
      docoddityDevProcess,
      ...getPageFunctionUtils(runner, docoddityDevProcess),
    };
    return response;
  }

  afterAll(async () => {
    await Promise.all([
      closeAllRunners(),
      closeAllChildProcesses(),
    ]);
  }, 100);

  return configureDocodditySite;
};
