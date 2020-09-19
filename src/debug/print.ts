import { EOL } from 'os';

export function print({
  source,
  sourceContent,
  sourceColumn,
  sourceLine,
}: {
  source: string;
  sourceContent: string;
  sourceColumn: number;
  sourceLine: number;
}): void {
  const sep = new Array(source.length).fill('-').join('');
  const indiactorLine = `${sep.substr(0, sourceColumn)}↑${sep.substr(
    sourceColumn + 1,
    source.length,
  )}`;
  /* eslint-disable no-console */
  console.log(sep);
  console.log(source);
  console.log(sep);
  let lines = sourceContent.split(EOL);
  lines.splice(sourceLine, 0, indiactorLine);
  lines = lines
    .slice(Math.max(0, sourceLine - 6), sourceLine + 6)
    .filter((l) => l.length > 0);
  console.log(lines.join(EOL));
  console.log(sep);
  /* eslint-enable no-console */
}
