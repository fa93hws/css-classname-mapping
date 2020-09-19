import { readFileSync as _readFileSync } from 'fs';
import { findSourceMap } from './find-sourcemap';

export function processFile(
  filePath: string,
  {
    readFileSync = _readFileSync,
  }: {
    readFileSync?: typeof _readFileSync;
  } = {},
): string {
  const content = readFileSync(filePath, { encoding: 'utf-8' });
  const sourcemapPathResult = findSourceMap(content);
  return sourcemapPathResult.expect(`Fail to find sourcemap in ${filePath}`);
}
