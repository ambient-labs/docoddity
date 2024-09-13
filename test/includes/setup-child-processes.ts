import terminate from 'terminate';
import { spawnPackageCommand } from './exec.js';
import { setupMap } from './setup-map.js';

type E = ReturnType<typeof spawnPackageCommand>;
const { register, closeAll } = setupMap<E>();
export const setupChildProcesses = () => ({
  registerChildProcess: register,
  closeAllChildProcesses: () => closeAll((childProcess) => terminate(childProcess.pid), (err, _1, name) => {
    if (err instanceof Error) {
      throw new Error(`error killing child process for files: ${name}: ${err.message}`)
    } else {
      throw err;
    }
  }),
});

