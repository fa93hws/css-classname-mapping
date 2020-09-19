import * as Yargs from 'yargs';
import { existsSync } from 'fs';
import { EOL } from 'os';
import { processFile } from './process-file';

type CliArgs = {
  files: readonly string[];
};

function reportInvalidFiles(files: readonly string[]) {
  const nonExistingFiles = files.filter((file) => !existsSync(file));
  throw new Error(
    ['the following files do not exists', ...nonExistingFiles].join(EOL),
  );
}

function handler({ files }: CliArgs) {
  reportInvalidFiles(files);
  files.forEach((file) => processFile(file));
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
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
