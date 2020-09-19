import { existsSync as _existsSync, readFileSync as _readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { RawSourceMap, SourceMapConsumer } from 'source-map';
import { Ok, Err, Result } from 'ts-results';
import { normalizePath } from '../utils/normalize-path';

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

export class CssProcessor {
  readonly css: string;

  readonly sourcemap: RawSourceMap;

  readonly sourceIndex: Map<string, number>;

  private constructor({ css, sourcemap }: { css: string; sourcemap: string }) {
    this.css = css;
    this.sourcemap = JSON.parse(sourcemap);
    this.sourceIndex = this.sourcemap.sources.reduce((acc, source, index) => {
      acc.set(source, index);
      return acc;
    }, new Map<string, number>());
  }

  static fromCssFile(
    filePath: string,
    { readFileSync = _readFileSync, existsSync = _existsSync }: FsStub = {},
  ): Result<CssProcessor, string> {
    const normalizedCssFilePath = normalizePath(filePath);
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
    return Ok(
      new CssProcessor({
        css: cssContent,
        sourcemap: sourcemapContent,
      }),
    );
  }

  async getSourceAt({
    line,
    column,
  }: {
    line: number;
    column: number;
  }): Promise<{
    source: string;
    sourceContent: string;
    sourceLine: number;
    sourceColumn: number;
  }> {
    return SourceMapConsumer.with(this.sourcemap, null, (consumer) => {
      const {
        source,
        line: sourceLine,
        column: sourceColumn,
      } = consumer.originalPositionFor({
        line,
        column,
      });
      if (source == null || sourceLine == null || sourceColumn == null) {
        throw new Error(
          `can not find sources from line:${line}, column:${column}. Got ${JSON.stringify(
            {
              source,
              sourceLine,
              sourceColumn,
            },
          )}`,
        );
      }
      const idx = this.sourceIndex.get(source);
      if (idx == null) {
        throw new Error(`source ${source} does not exist in the sourcemap`);
      }
      if (this.sourcemap.sourcesContent == null) {
        throw new Error(`sourceContent is empty!`);
      }
      return {
        source,
        sourceContent: this.sourcemap.sourcesContent[idx],
        sourceLine,
        sourceColumn,
      };
    });
  }
}
