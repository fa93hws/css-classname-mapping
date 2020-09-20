import type { RawSourceMap } from 'source-map';

import type { CssParser } from '../utils/css-parser';
import { generateClassnameLocations } from './classname-location';

type SerializedLocation = string;
// serializedLocation -> classname
type LocationClassname = Map<SerializedLocation, string>;

// for testing purpose
export function serializeKey({
  line,
  column,
}: {
  line: number;
  column: number;
}): string {
  return `${line}:${column}`;
}

// for testing purpose
export function deserializeKey(key: string): { line: number; column: number } {
  const regex = /^(\d+):(\d+)$/;
  const match = regex.exec(key);
  if (match == null || match.length !== 3) {
    throw new Error(`fail to deserialize key ${key}`);
  }
  const [, lineStr, columnStr] = match;
  const line = parseInt(lineStr, 10);
  if (Number.isNaN(line)) {
    throw new Error(`failed to parse line ${lineStr}`);
  }
  const column = parseInt(columnStr, 10);
  if (Number.isNaN(column)) {
    throw new Error(`failed to parse column ${column}`);
  }
  return { line, column };
}

// sourcePath(e.g. webpack/foo/bar.css) -> LocationClassname
const cache = new Map<string, LocationClassname>();

export function getLocationToClassnameFromSourcemap(
  rawSourcemap: RawSourceMap,
  cssParser: CssParser,
  // sourcePath(e.g. webpack/foo/bar.css) -> LocationClassname
): Map<string, LocationClassname> {
  const results = new Map<SerializedLocation, LocationClassname>();

  if (rawSourcemap.sourcesContent == null) {
    throw new Error('sourceContents should not be empty');
  }
  for (let idx = 0; idx < rawSourcemap.sources.length; idx += 1) {
    const source = rawSourcemap.sources[idx];

    const cachedValue = cache.get(source);
    if (cachedValue != null) {
      results.set(source, cachedValue);
      continue;
    }

    const sourceContent = rawSourcemap.sourcesContent[idx];
    const locations = generateClassnameLocations({
      path: source,
      rootNode: cssParser.parseFromContent({
        content: sourceContent,
        cacheKey: source,
      }),
    });
    const locationToClassnames: LocationClassname = new Map<
      SerializedLocation,
      string
    >();
    locations.forEach((location, classname) => {
      locationToClassnames.set(
        serializeKey({
          line: location.line.start,
          column: location.column.start,
        }),
        classname,
      );
    });
    cache.set(source, locationToClassnames);
    results.set(source, locationToClassnames);
  }

  return results;
}
