/* eslint-disable no-console */
import { EOL } from 'os';
import { yellow, red } from 'chalk';

import { Location } from '../processor/location';

function highlightTheLine(theLine: string): string {
  return yellow(theLine) + EOL + yellow('^'.repeat(theLine.length));
}

function highlightTheLineWithClassnames(
  theLine: string,
  classnames: Set<string>,
): string {
  const marking: {
    start: number;
    length: number;
  }[] = [];
  classnames.forEach((classname) => {
    const regex = new RegExp(`\\.${classname}[^a-zA-Z0-9-_]`);
    const match = regex.exec(theLine);
    if (match == null) {
      throw new Error(
        `failed to find classname ${classname} in theLine: ${theLine}`,
      );
    }
    marking.push({
      start: match.index,
      length: classname.length + 1,
    });
  });

  const buffer: string[] = [];
  let idxInTheLine = 0;
  for (let idx = 0; idx < marking.length; idx += 1) {
    const { start, length } = marking[idx];
    buffer.push(yellow(theLine.substr(idxInTheLine, start - idxInTheLine)));
    buffer.push(red(theLine.substr(start, length)));
    idxInTheLine = start + length;
  }
  buffer.push(yellow(theLine.substr(idxInTheLine)));

  buffer.push(EOL);
  idxInTheLine = 0;
  for (let idx = 0; idx < marking.length; idx += 1) {
    const { start, length } = marking[idx];
    buffer.push(' '.repeat(start - idxInTheLine));
    buffer.push(red('^'.repeat(length)));
    idxInTheLine = start + length + 1;
  }
  return buffer.join('');
}

function getSourceParagraphs({
  sourceContent,
  location,
  limit,
}: {
  sourceContent: string;
  location: Location;
  limit: number;
}): {
  above: string;
  theLine: string;
  below: string;
} {
  const lines = sourceContent.split(EOL);
  const theLine = lines[location.line - 1];
  const above = lines
    .slice(Math.max(0, location.line - limit - 1), location.line - 1)
    .filter((l) => l.length > 0)
    .join(EOL);
  const below = lines
    .slice(location.line, location.line + limit + 1)
    .filter((l) => l.length > 0)
    .join(EOL);
  return {
    theLine,
    above,
    below,
  };
}

export function print({
  sourceContent,
  location,
  highlightedClassnames,
  limit = 6,
}: {
  sourceContent: string;
  location: Location;
  highlightedClassnames?: Set<string>;
  limit?: number;
}): void {
  const { theLine, above, below } = getSourceParagraphs({
    sourceContent,
    location,
    limit,
  });
  console.log('');
  console.log(above);
  if (highlightedClassnames == null) {
    console.log(highlightTheLine(theLine));
  } else {
    console.log(highlightTheLineWithClassnames(theLine, highlightedClassnames));
  }
  console.log(below);
}
