import * as Yargs from 'yargs';

import { CssParser } from '../utils/css-parser';
import { Location } from '../processor/location';
import {
  getOriginalSelectors,
  generateLocationToSelectorFromSources,
} from '../processor/process-file';
import { findSourceMap } from '../processor/find-sourcemap';
import { print } from './logging';

type CliArgs = {
  cssFilePath: string;
  line: number;
  column: number;
};

async function handler({ cssFilePath, line, column }: CliArgs): Promise<void> {
  const cssParser = new CssParser();
  const { sourcemap } = findSourceMap(cssFilePath).unwrap();
  const sourceLocToSelector = generateLocationToSelectorFromSources(
    sourcemap.raw,
    cssParser,
  );
  const minifiedLocation = new Location({ line, column });
  const originalSelector = await getOriginalSelectors(
    minifiedLocation.serialize(),
    sourcemap.raw,
    sourceLocToSelector,
  );
  // eslint-disable-next-line no-console
  console.log('sourceFile: ', originalSelector.file);
  print({
    sourceContent: originalSelector.sourceContent,
    location: originalSelector.sourceLocation,
  });
}

export const FindSourcePositionModule: Yargs.CommandModule<unknown, CliArgs> = {
  command: 'find-source-at',
  describe: 'find the source code based on the position',
  builder: (): Yargs.Argv<CliArgs> =>
    Yargs.option('cssFilePath', {
      demandOption: true,
      type: 'string',
      describe: 'path to css file',
    })
      .option('line', {
        demandOption: true,
        type: 'number',
        describe: 'line number',
      })
      .option('column', {
        demandOption: true,
        type: 'number',
        describe: 'column number',
      }),
  handler,
};
