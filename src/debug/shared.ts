import { EOL } from 'os';
import { yellow, red } from 'chalk';

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
