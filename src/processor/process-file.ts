import { EOL } from 'os';
import type { RawSourceMap } from 'source-map';

import { CssParser } from '../utils/css-parser';
import { Location } from './location';
import { findSourceMap } from './find-sourcemap';
import { generateClassnameLocations } from './classname-location';
import {
  getLocationToClassnameFromSourcemap,
  serializeKey,
} from './location-classname';
import { getSourceAt } from '../debug/shared';

async function findOriginalClassnameByMinifiedLoc(
  minifiedLoc: Location,
  sourcemap: RawSourceMap,
  // source -> Map<location serielized key, classname>
  sourceLocToClass: Map<string, Map<string, string>>,
): Promise<string> {
  const sourceLocation = await getSourceAt({
    line: minifiedLoc.line.start,
    column: minifiedLoc.column.start,
    rawSourcemap: sourcemap,
  });
  const localSourceLocToClass = sourceLocToClass.get(sourceLocation.source);
  if (localSourceLocToClass == null) {
    throw new Error(
      `source file ${sourceLocation.source} can not be found in sourcemap for ${sourcemap.file}`,
    );
  }
  const originalClassname = localSourceLocToClass.get(
    serializeKey({
      line: sourceLocation.sourceLine,
      column: sourceLocation.sourceColumn,
    }),
  );
  if (originalClassname == null) {
    const errorMessage = [
      'Fail to find originalClassname',
      `Trying to search line=${sourceLocation.sourceLine}, column=${sourceLocation.sourceColumn}`,
      `minifiedLoc is ${JSON.stringify(minifiedLoc)}@${sourcemap.file}`,
    ].join(EOL);
    throw new Error(errorMessage);
  }
  return originalClassname;
}

export function processFile(cssFilePath: string): void {
  const cssParser = new CssParser();
  const { css, sourcemap } = findSourceMap(cssFilePath).unwrap();
  const minifiedCssRootNode = cssParser.parseFromContent({
    content: css.content,
    cacheKey: css.path,
  });
  const minifiedClassToLoc = generateClassnameLocations({
    path: css.path,
    rootNode: minifiedCssRootNode,
  });
  const sourceLocToClass = getLocationToClassnameFromSourcemap(
    sourcemap.raw,
    cssParser,
  );
  return;
  // minified name -> original name
  const nameMapping = new Map<string, string>();
  const promises: Promise<void>[] = [];
  minifiedClassToLoc.forEach((location, classname) => {
    const promise = new Promise<void>((resolve) => {
      findOriginalClassnameByMinifiedLoc(
        location,
        sourcemap.raw,
        sourceLocToClass,
      )
        .then((originalClassname) => {
          nameMapping.set(classname, originalClassname);
          resolve();
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
          process.exit(1);
        });
    });
    promises.push(promise);
  });
  Promise.all(promises).then(() => {
    console.log(nameMapping);
  });
}
