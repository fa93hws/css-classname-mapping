import * as Yargs from 'yargs';
import { CssProcessor } from './processor/css-processor';
import { FindSourcePositionModule } from './debug/find-source-position';
import { FindOriginalNameModule } from './debug/find-original-name';

type CliArgs = {
  files: readonly string[];
};

function handler({ files }: CliArgs) {
  files.forEach((file) => CssProcessor.fromCssFile(file));
}

export function main(): void {
  Yargs.command('$0 <files...>', 'generate css classname mapping', {
    builder: (): Yargs.Argv<CliArgs> =>
      Yargs.positional('files', {
        describe: 'path to css files',
        demandOption: true,
        type: 'string',
        // see https://github.com/yargs/yargs/issues/1392
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any,
    handler,
  })
    .command(
      'find-source',
      'find the source code based on the position',
      FindSourcePositionModule,
    )
    .command(
      'original-classname',
      'find the original classname based on the classname',
      FindOriginalNameModule,
    )
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
