import { spawnPackageCommand } from "./exec.js";
import { RunDocoddityDev } from "./types.js";

const stripColor = (str: string) => str.trim().replace(/\x1B\[[0-9;]*[mGK]/g, '');

export const runDocoddityDev: RunDocoddityDev = (cwd: string, {
  stdout,
  stderr,
} = {}) => new Promise((resolve, reject) => {
  const stdoutChunks: string[] = [];
  const stderrChunks: string[] = [];
  const command = `docoddity dev`;
  const child = spawnPackageCommand(command, cwd);
  child.on('error', reject);
  child.on('close', (code) => {
    if (code !== 0) {
      const stdoutOutput = stdoutChunks.length ? `"${stdoutChunks.join(' ')}"` : '(no stdout output)';
      const stderrOutput = stderrChunks.length ? `"${stderrChunks.join(' ')}"` : '(no stderr output)';
      reject(`[${code}]: ${command} failed, stderr: ${stderrOutput}, stdout: ${stdoutOutput}`);
    }
  });
  const handleStringData = (stringData: string) => {
    const strippedStringData = stripColor(stringData);
    if (strippedStringData.includes('[Docoddity] dev server running in port ')) {
      const port = Number(strippedStringData.match(/\[Docoddity\] dev server running in port (\d+)/)?.[1]);
      if (!port) {
        reject(`No port found in string: "${strippedStringData}"`);
      } else {
        resolve({ child, port })
      }
    }
  }
  child.stdout.on('data', (data: Uint8Array) => {
    const stringData = stripColor(data.toString());
    if (stringData) {
      stdoutChunks.push(stringData);
      if (stdout) {
        stdout(stringData);
      }
      handleStringData(stringData);
    }
  });

  child.stderr.on('data', (data: Uint8Array) => {
    const stringData = stripColor(data.toString());
    if (stringData) {
      stderrChunks.push(stringData);
      console.error(stringData)
      if (stderr) {
        stderr(stringData);
      }
      handleStringData(stringData);
    }
  });
});
