import * as Yargs from 'yargs';

import { pairSelectors } from '../processor/selectors-pairing';
import { CssParser } from '../utils/css-parser';
import { Location } from '../processor/location';
import {
  getOriginalSelectors,
  generateLocationToSelectorFromSources,
} from '../processor/process-file';
import {
  generateLocationToSelector,
  LocationToSelector,
} from '../processor/selector-location';
import { findSourceMap } from '../processor/find-sourcemap';
import { print } from './logging';

type CliArgs = {
  cssFilePath: string;
  classname: string;
};

function findClassnameLocation(
  classname: string,
  minifiedLocToSelector: LocationToSelector,
): Location {
  // It's for debugging purpose, doens't need to be super efficient
  // eslint-disable-next-line no-restricted-syntax
  for (const [loc, selector] of Array.from(minifiedLocToSelector)) {
    if (selector.includes(`.${classname}`)) {
      return Location.fromSerializedKey(loc);
    }
  }
  throw new Error(`can not find classname (.${classname}) in css file`);
}

async function handler({ cssFilePath, classname }: CliArgs): Promise<void> {
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
  const minifiedLocation = findClassnameLocation(
    classname,
    minifiedLocToSelector,
  );
  const originalSelector = await getOriginalSelectors(
    minifiedLocation.serialize(),
    sourcemap.raw,
    sourceLocToSelector,
  );
  const minifiedSelector = minifiedLocToSelector.get(
    minifiedLocation.serialize(),
  );
  if (minifiedSelector == null) {
    throw new Error(
      `faild to find selector in minified css file at location ${minifiedLocation.serialize()}`,
    );
  }
  const pairResult = pairSelectors({
    minified: minifiedSelector,
    original: originalSelector.selector,
  });
  const originalClassname = pairResult.get(classname);
  if (originalClassname == null) {
    throw new Error(
      `failed to find original classname for ${classname} in ${pairResult}`,
    );
  }
  // eslint-disable-next-line no-console
  console.log('sourceFile:', originalSelector.file);
  // eslint-disable-next-line no-console
  console.log('mapping:', classname, '->', Array.from(originalClassname));
  print({
    sourceContent: originalSelector.sourceContent,
    location: originalSelector.sourceLocation,
    highlightedClassnames: originalClassname,
  });
}

export const FindOriginalNameModule: Yargs.CommandModule<unknown, CliArgs> = {
  command: 'find-source-for',
  describe: 'find the original classname based on the classname',
  builder: (): Yargs.Argv<CliArgs> =>
    Yargs.option('cssFilePath', {
      demandOption: true,
      type: 'string',
      describe: 'path to css file',
    }).option('classname', {
      demandOption: true,
      type: 'string',
      describe: 'minified classname',
    }),
  handler,
};
