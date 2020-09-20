import * as Yargs from 'yargs';

import { findSourceMap } from '../processor/find-sourcemap';
import { generateClassnameLocations } from '../processor/classname-location';
import { CssParser } from '../utils/css-parser';
import { getSourceAt, print } from './shared';

type CliArgs = {
  cssFilePath: string;
  classname: string;
};

async function handler({ cssFilePath, classname }: CliArgs): Promise<void> {
  const cssParser = new CssParser();
  const { css, sourcemap } = findSourceMap(cssFilePath).unwrap();
  const locations = generateClassnameLocations({
    path: css.path,
    rootNode: cssParser.parseFromContent({
      content: css.content,
      cacheKey: css.path,
    }),
  });
  const location = locations.get(classname);
  if (location == null) {
    throw new Error(`classname ${classname} does not exists in the sourcemap`);
  }
  const sourceLocation = await getSourceAt({
    line: location.line.start,
    column: location.column.start,
    rawSourcemap: sourcemap.raw,
  });
  print(sourceLocation);
}

export const FindOriginalNameModule: Yargs.CommandModule<unknown, CliArgs> = {
  command: 'original-classname',
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
