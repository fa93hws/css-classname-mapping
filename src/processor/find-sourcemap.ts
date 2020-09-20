/**
 * read minified css file to find the corresponding sourcemap
 */

import { RawSourceMap } from 'source-map';
import { Result, Ok, Err } from 'ts-results';
import { resolve, dirname } from 'path';
import { existsSync as _existsSync, readFileSync as _readFileSync } from 'fs';

import { normalizePath } from '../utils/normalize-path';

export type MinifiedCSSInfo = {
  css: {
    path: string;
    content: string;
  };
  sourcemap: {
    // path to the sourcemap
    path: string;
    raw: RawSourceMap;
  };
};

function findSourceMapPath(content: string): Result<string, null> {
  const regex = /^\/\*# sourceMappingURL=(.+)\*\//m;
  const match = regex.exec(content);
  if (match == null || match.length !== 2) {
    return Err(null);
  }
  return Ok(match[1]);
}

type FsStub = {
  readFileSync?: typeof _readFileSync;
  existsSync?: typeof _existsSync;
};

export function findSourceMap(
  minifiedCssPath: string,
  { readFileSync = _readFileSync, existsSync = _existsSync }: FsStub = {},
): Result<MinifiedCSSInfo, string> {
  const normalizedCssFilePath = normalizePath(minifiedCssPath);
  if (!existsSync(normalizedCssFilePath)) {
    return Err(`Css file@${normalizedCssFilePath} does not exists`);
  }
  const cssContent = readFileSync(normalizedCssFilePath, {
    encoding: 'utf-8',
  });
  const sourcemapPathResult = findSourceMapPath(cssContent);
  if (sourcemapPathResult.err) {
    return Err(`Fail to find sourcemap in ${normalizedCssFilePath}`);
  }
  const sourcemapPath = resolve(
    dirname(normalizedCssFilePath),
    sourcemapPathResult.val,
  );
  if (!existsSync(sourcemapPath)) {
    return Err(
      `sourcemap@${sourcemapPath} from ${normalizedCssFilePath} does not exists`,
    );
  }
  const sourcemapContent = readFileSync(sourcemapPath, { encoding: 'utf-8' });
  try {
    const sourcemapRaw = JSON.parse(sourcemapContent);
    return Ok({
      css: {
        path: normalizedCssFilePath,
        content: cssContent,
      },
      sourcemap: {
        path: sourcemapPath,
        raw: sourcemapRaw,
      },
    });
  } catch (e) {
    return Err(`Fail to JSON.parse sourcemap: ${e}`);
  }
}
