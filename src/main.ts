import * as Yargs from 'yargs';
// import { FindSourcePositionModule } from './debug/find-source-position';
// import { FindOriginalNameModule } from './debug/find-original-classname';
import { processFile } from './processor/process-file';

type CliArgs = {
  files: readonly string[];
};

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
    handler: ({ files }: CliArgs) => files.forEach(processFile),
  })
    // .command(FindSourcePositionModule)
    // .command(FindOriginalNameModule)
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
