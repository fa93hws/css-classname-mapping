import { EOL } from 'os';
import * as Yargs from 'yargs';
import { CssProcessor } from '../processor/css-processor';

type CliArgs = {
  cssFilePath: string;
  line: number;
  column: number;
};

async function handler({ cssFilePath, line, column }: CliArgs): Promise<void> {
  const processor = CssProcessor.fromCssFile(cssFilePath).unwrap();
  const {
    source,
    sourceContent,
    sourceColumn,
    sourceLine,
  } = await processor.getSourceAt({
    line,
    column,
  });
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
    .slice(Math.max(0, sourceLine - 5), sourceLine + 5 + 1)
    .filter((l) => l.length > 0);
  console.log(lines.join(EOL));
  console.log(sep);
  /* eslint-enable no-console */
}

export const FindSourcePositionModule: Yargs.CommandModule<unknown, CliArgs> = {
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
