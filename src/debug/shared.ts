import { EOL } from 'os';
import { SourceMapConsumer, RawSourceMap } from 'source-map';
import { yellow, red } from 'chalk';

export async function getSourceAt({
  line,
  column,
  rawSourcemap,
}: {
  line: number;
  column: number;
  rawSourcemap: RawSourceMap;
}): Promise<{
  source: string;
  sourceContent: string;
  sourceLine: number;
  sourceColumn: number;
}> {
  return SourceMapConsumer.with(rawSourcemap, null, (consumer) => {
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
    const idx = rawSourcemap.sources.indexOf(source);
    if (idx < 0) {
      throw new Error(`source ${source} does not exist in the sourcemap`);
    }
    if (rawSourcemap.sourcesContent == null) {
      throw new Error(`sourceContent is empty!`);
    }
    return {
      source,
      sourceContent: rawSourcemap.sourcesContent[idx],
      sourceLine,
      sourceColumn,
    };
  });
}

function highlightClassname({
  line,
  classname,
  column,
}: {
  line: string;
  classname: string;
  column: number;
}): string {
  const startIdx = column;
  const endIdx = startIdx + classname.length + 1;
  return (
    yellow(line.slice(0, startIdx)) +
    red(line.slice(startIdx, endIdx)) +
    yellow(line.slice(endIdx, line.length))
  );
}

export function print(
  {
    source,
    sourceContent,
    sourceColumn,
    sourceLine,
  }: {
    source: string;
    sourceContent: string;
    sourceColumn: number;
    sourceLine: number;
  },
  originalClassname?: string,
): void {
  const sep = new Array(process.stdout.columns).fill('-').join('');
  const indiactorLine = `${sep.substr(0, sourceColumn)}↑${sep.substr(
    sourceColumn + 1,
    process.stdout.columns,
  )}`;
  /* eslint-disable no-console */
  console.log(sep);
  console.log(source);
  console.log(sep);
  let lines = sourceContent.split(EOL);
  lines[sourceLine - 1] =
    originalClassname == null
      ? yellow(lines[sourceLine - 1])
      : highlightClassname({
          line: lines[sourceLine - 1],
          classname: originalClassname,
          column: sourceColumn,
        });
  if (originalClassname == null) {
    lines.splice(sourceLine, 0, yellow(indiactorLine));
  }
  lines = lines
    .slice(Math.max(0, sourceLine - 6), sourceLine + 6)
    .filter((l) => l.length > 0);
  console.log(lines.join(EOL));
  console.log(sep);
  /* eslint-enable no-console */
}
