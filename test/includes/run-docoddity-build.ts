import { spawnPackageCommand } from "./exec.js";
import {
  type RunDocoddityBuild
} from "./types.js";

export const runDocoddityBuild: RunDocoddityBuild = (buildDir, cwd, { stdout, stderr } = {}) => new Promise((resolve, reject) => {
  const child = spawnPackageCommand(`docoddity build --targetDir ${buildDir}`, cwd);

  const stdoutChunks: Uint8Array[] = [];
  const stderrChunks: Uint8Array[] = [];
  child.stdout.on('data', (data: Uint8Array) => {
    stdoutChunks.push(data);
  });
  child.stdout.on('end', () => {
    if (stdout) {
      stdout(Buffer.concat(stdoutChunks).toString());
    }
  });

  child.stderr.on('data', (data: Uint8Array) => {
    stderrChunks.push(data);
  });
  child.stderr.on('end', () => {
    if (stderr) {
      stderr(Buffer.concat(stderrChunks).toString());
    }
  });
  child.on('error', reject);
  child.on('close', (code) => {
    if (code === 0) {
      resolve();
    } else {
      reject(code);
    }
  });
});
