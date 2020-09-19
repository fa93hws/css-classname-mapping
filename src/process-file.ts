import { existsSync as _existsSync, readFileSync as _readFileSync } from 'fs';
import { Ok, Err, Result } from 'ts-results';

type FsStub = {
  readFileSync?: typeof _readFileSync;
  existsSync?: typeof _existsSync;
};

export function findSourceMapPath(content: string): Result<string, null> {
  const regex = /^\/\*# sourceMappingURL=(.+)\*\//m;
  const match = regex.exec(content);
  if (match == null || match.length !== 2) {
    return Err(null);
  }
  return Ok(match[1]);
}

export function processFile(
  filePath: string,
  { readFileSync = _readFileSync, existsSync = _existsSync }: FsStub = {},
): Result<string, string> {
  const content = readFileSync(filePath, { encoding: 'utf-8' });
  const sourcemapPathResult = findSourceMapPath(content);
  if (sourcemapPathResult.err) {
    return Err(`Fail to find sourcemap in ${filePath}`);
  }
  const sourcemapPath = sourcemapPathResult.val;
  if (!existsSync(sourcemapPath)) {
    return Err(`sourcemap@${filePath} does not exist`);
  }
  const sourcemapContent = readFileSync(sourcemapPath, { encoding: 'utf-8' });
  return Ok(sourcemapContent);
}
