import type { Runner } from './runner.js';
import type { spawnPackageCommand } from './exec.js';
import type { getPageFunctionUtils } from './get-page-function-utils.js';

export interface DocoddityTestFile {
  filepath: string;
  content: string | Record<string, unknown> | unknown[];
}

export interface STD {
  stdout?: (...data: string[]) => void;
  stderr?: (...data: string[]) => void;
}


export interface Args {
  std?: STD;
}

export type PrintURL = (d?: number, url?: string) => Promise<string>;
export type DocoddityDevProcess = ReturnType<typeof spawnPackageCommand>;

interface StandardConfigureResponse {
  runner: Runner;
  printURL: PrintURL;
  updateFiles: (files: DocoddityTestFile[], waitForDocoddity?: boolean) => Promise<void>;
}
type ConfigureDocodditySite<T extends StandardConfigureResponse> = (files: DocoddityTestFile[], args?: Args) => Promise<T>;

export type WaitUntilMessage = (msg: string, timeout?: number) => Promise<void>;
export type WaitForSelector = (selector: string, timeout?: number, interval?: number) => Promise<void>;
export type WaitFor = (fn: () => Promise<void | any>, timeout?: number, interval?: number) => Promise<void>;
export type ConfigureBuildDocodditySite = ConfigureDocodditySite<StandardConfigureResponse & ReturnType<typeof getPageFunctionUtils>>;
export type ConfigureDevDocodditySite = ConfigureDocodditySite<StandardConfigureResponse & ReturnType<typeof getPageFunctionUtils> & {
  docoddityDevProcess: DocoddityDevProcess;
  removeFiles: (files: string[] | string) => Promise<void>;
  renameFiles: (files: { source: string; target: string; content?: string; }[]) => Promise<void>;
}>;

export type RunDocoddityBuild = (buildDir: string, cwd: string, std?: STD) => Promise<void>;
export type RunDocoddityDev = (cwd: string, std?: STD) => Promise<{ child: DocoddityDevProcess; port: number; }>;

export type SetupBuild = (args?: Args) => ConfigureBuildDocodditySite;
export type SetupDev = (args?: Args) => ConfigureDevDocodditySite;
