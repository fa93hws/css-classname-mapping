import { readFileSync as _readFileSync } from 'fs';
import { Ok, Err, Result } from 'ts-results';

export function findSourceMap(content: string): Result<string, null> {
  const regex = /^\/\*# sourceMappingURL=(.+)\*\//m;
  const match = regex.exec(content);
  if (match == null || match.length !== 2) {
    return Err(null);
  }
  return Ok(match[1]);
}

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
