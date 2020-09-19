import * as Yargs from 'yargs';
import { CssParser, collectClassnames } from '../processor/classname-helper';
import { CssProcessor } from '../processor/css-processor';
import { print } from './print';

type CliArgs = {
  cssFilePath: string;
  classname: string;
};

async function handler({ cssFilePath, classname }: CliArgs): Promise<void> {
  const cssParser = new CssParser();
  const rootNode = cssParser.parseFromPath(cssFilePath);
  const classnames = collectClassnames(rootNode);
  const position = classnames.get(classname);
  if (position == null) {
    throw new Error(`classname ${classname} does not exists in the sourcemap`);
  }
  const processor = CssProcessor.fromCssFile(cssFilePath).unwrap();
  const sourcePosition = await processor.getSourceAt({
    line: position.line,
    column: position.columnStart,
  });
  print(sourcePosition);
}

export const FindOriginalNameModule: Yargs.CommandModule<unknown, CliArgs> = {
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
