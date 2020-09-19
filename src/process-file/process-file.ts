import { readFileSync as _readFileSync } from 'fs';
import { findSourceMap } from './find-sourcemap';

export function processFile(
  filePath: string,
  {
    readFileSync = _readFileSync,
  }: {
    readFileSync?: typeof _readFileSync;
  } = {},
) {
  const content = readFileSync(filePath, { encoding: 'utf-8' });
  const sourcemapPath = findSourceMap(content);
}
