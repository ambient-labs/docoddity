import path from 'path';
import crypto from 'crypto';
// import { DocoddityTestFile } from "./types.js";
import { ROOT } from './config.js';

const getRandomString = () => `${new Date().getTime()}${Math.random()}`;

const getTestName = () => {
  const isConcurrent = process.env.CI === 'true';
  if (isConcurrent) {
    return getRandomString();
  }
  return expect.getState().currentTestName;
}

const getHashedName = (contents?: string) => crypto.createHash('md5').update(contents || getRandomString()).digest('hex'); //skipcq: JS-D003
export const getCwd = () => {
  // export const getCwd = (files: DocoddityTestFile[], key: string) => {
  const testName = getTestName();
  // console.log('testName', testName)
  const hashedTestName = getHashedName(testName);
  // const testName = getHashedName(JSON.stringify(files) + key);
  // const testName = getHashedName(getRandomString());
  return path.resolve(ROOT, 'test/.sites/', hashedTestName);
}
