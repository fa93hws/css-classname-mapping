import * as Yargs from 'yargs';

type CliArgs = {
  files: readonly string[];
}

function handler({ files }: CliArgs) {
  console.log(files);
}

export function main() {
  Yargs.command('$0 <files...>', 'generate css classname mapping', {
    builder: (): Yargs.Argv<CliArgs> => Yargs.positional('files', {
      describe: 'path to css files',
      demandOption: true,
      type: 'string'
    }) as any,
    handler,
  })
  .strict(true)
  .exitProcess(true)
  .demandCommand()
  .showHelpOnFail(false, 'Specify --help for available options')
  .help()
  .parse();
}