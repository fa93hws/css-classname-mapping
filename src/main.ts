import * as Yargs from 'yargs';
import { existsSync } from 'fs';
import { EOL } from 'os';
import { processFile } from './process-file/process-file';

type CliArgs = {
  files: readonly string[];
}

function reportInvalidFiles(files: readonly string[]) {
  const nonExistingFiles = files.filter(file => !existsSync(file));
  throw new Error([
    'the following files do not exists',
    ...nonExistingFiles,
  ].join(EOL));
}

function handler({ files }: CliArgs) {
  reportInvalidFiles(files);
  files.forEach(file => processFile(file));
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
