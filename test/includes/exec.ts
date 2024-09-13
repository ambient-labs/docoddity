import { spawn, } from 'child_process';

const parseCommand = (_command: string | string[]) => {
  const command = Array.isArray(_command) ? _command : _command.split(' ');
  if (command[0] === 'pnpm') {
    return command.slice(1);
  }
  return command;
};

export const spawnPackageCommand = (
  command: string | string[],
  cwd: string,
) => spawn('pnpm', parseCommand(command), {
  shell: true,
  cwd,
  stdio: ["inherit", 'pipe', 'pipe',],
});
