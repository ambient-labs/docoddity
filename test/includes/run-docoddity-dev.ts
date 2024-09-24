import { spawnPackageCommand } from "./exec.js";
import { RunDocoddityDev } from "./types.js";

export const runDocoddityDev: RunDocoddityDev = (cwd: string, {
  stdout,
  stderr,
} = {}) => new Promise((resolve, reject) => {
  const stderrChunks: Uint8Array[] = [];
  const command = `docoddity dev --buildDir .docoddity/staging`;
  const child = spawnPackageCommand(command, cwd);
  child.on('error', reject);
  child.on('close', (code) => {
    if (code !== 0) {
      reject(`[${code}]: ${command} failed: ${stderrChunks.toString()}`);
    }
  });
  const handleStringData = (stringData: string) => {
    if (stringData.includes('[Docoddity] dev server running in port ')) {
      const port = Number(stringData.match(/\[Docoddity\] dev server running in port (\d+)/)?.[1]);
      resolve({ child, port })
    }
  }
  child.stdout.on('data', (data: Uint8Array) => {
    const stringData = data.toString();
    if (stdout) {
      stdout(stringData);
    }
    handleStringData(stringData);
  });

  child.stderr.on('data', (data: Uint8Array) => {
    stderrChunks.push(data);
    const stringData = data.toString();
    console.log(stringData)
    if (stderr) {
      stderr(stringData);
    }
    handleStringData(stringData);
  });
});
