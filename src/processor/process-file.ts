import { RawSourceMap, SourceMapConsumer } from 'source-map';

import { pairSelectors } from './selectors-pairing';
import { ClassnameMapping, OutputObject } from './classname-mapping';
import { CssParser } from '../utils/css-parser';
import { Location } from './location';
import { findSourceMap } from './find-sourcemap';
import {
  generateLocationToSelector,
  LocationToSelector,
} from './selector-location';

async function getOriginalSelectors(
  serializedLoc: string,
  sourcemap: RawSourceMap,
  // source -> Map<location serielized key, classname>
  sourceLocToSelector: Map<string, LocationToSelector>,
): Promise<{
  selector: string;
  file: string;
}> {
  return new Promise((resolve, reject) => {
    const location = Location.fromSerializedKey(serializedLoc);
    SourceMapConsumer.with(sourcemap, null, (consumer) => {
      const {
        source: sourcePath,
        line: sourceLine,
        column: sourceColumn,
      } = consumer.originalPositionFor(location);
      if (sourcePath == null || sourceLine == null || sourceColumn == null) {
        return reject(
          new Error(`fail to find the original location @${serializedLoc}`),
        );
      }
      const locationToSelector = sourceLocToSelector.get(sourcePath);
      if (locationToSelector == null) {
        return reject(
          new Error(
            `fail to get location to selector mapping for ${sourcePath}`,
          ),
        );
      }
      const sourceLocation = new Location({
        line: sourceLine,
        column: sourceColumn,
      });
      const originalSelector = locationToSelector.get(
        sourceLocation.serialize(),
      );
      if (originalSelector == null) {
        return reject(
          new Error(
            `fail to get original selector@${sourceLocation.serialize()} in ${sourceLocation}`,
          ),
        );
      }
      return resolve({
        selector: originalSelector,
        file: sourcePath,
      });
    });
  });
}

function generateLocationToSelectorFromSources(
  sourcemap: RawSourceMap,
  cssParser: CssParser,
): Map<string, LocationToSelector> {
  const output = new Map<string, LocationToSelector>();
  const { sources: paths, sourcesContent: contents } = sourcemap;
  if (contents == null) {
    throw new Error('content can not be empty');
  }
  if (paths.length !== contents.length) {
    throw new Error('lengh of the paths and contents do not match');
  }
  for (let idx = 0; idx < paths.length; idx += 1) {
    const path = paths[idx];
    const rootNode = cssParser.parseFromContent({
      content: contents[idx],
      cacheKey: path,
    });
    const locationToSelector = generateLocationToSelector({
      rootNode,
      cacheKey: path,
    });
    output.set(path, locationToSelector);
  }
  return output;
}

async function generateMapping(
  minifiedLocToSelector: LocationToSelector,
  sourceLocToSelector: Map<string, LocationToSelector>,
  sourcemap: RawSourceMap,
): Promise<OutputObject> {
  const classnameMapping = new ClassnameMapping();
  const promises = Array.from(minifiedLocToSelector).map(
    async ([minifiedLoc, minifiedSelector]) => {
      const originalSelector = await getOriginalSelectors(
        minifiedLoc,
        sourcemap,
        sourceLocToSelector,
      );
      const localMapping = pairSelectors({
        minified: minifiedSelector,
        original: originalSelector.selector,
      });
      localMapping.forEach((originalClassnames, minifiedClassname) => {
        originalClassnames.forEach((originalClassname) => {
          classnameMapping.set({
            minified: minifiedClassname,
            original: originalClassname,
            sourceFile: originalSelector.file,
          });
        });
      });
    },
  );
  await Promise.all(promises);
  return classnameMapping.toOutputObject();
}

export async function processFile(cssFilePath: string): Promise<void> {
  const cssParser = new CssParser();
  const { css, sourcemap } = findSourceMap(cssFilePath).unwrap();
  const minifiedCssRootNode = cssParser.parseFromContent({
    content: css.content,
    cacheKey: css.path,
  });
  const minifiedLocToSelector = generateLocationToSelector({
    rootNode: minifiedCssRootNode,
    cacheKey: css.path,
  });
  const sourceLocToSelector = generateLocationToSelectorFromSources(
    sourcemap.raw,
    cssParser,
  );
  try {
    const output = await generateMapping(
      minifiedLocToSelector,
      sourceLocToSelector,
      sourcemap.raw,
    );
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`fail to process file ${cssFilePath}`);
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  }
}
