import * as Yargs from 'yargs';
import { writeFileSync } from 'fs';

import { FindSourcePositionModule } from './debug/find-source-position';
import { FindOriginalNameModule } from './debug/find-original-classname';
import { ClassnameMapping } from './processor/classname-mapping';
import { processFile } from './processor/process-file';

type CliArgs = {
  files: readonly string[];
  output?: string;
};

async function handler({ files, output }: CliArgs) {
  const classnameMapping = new ClassnameMapping();
  await Promise.all(files.map((file) => processFile(file, classnameMapping)));
  const mappingObject = classnameMapping.toOutputObject();
  const outputStr = JSON.stringify(mappingObject, null, 2);
  if (output != null) {
    writeFileSync(output, outputStr);
  } else {
    console.log(outputStr); // eslint-disable-line no-console
  }
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
      }).option('output', {
        describe: 'output path, print to console if omitted',
        type: 'string',
      }) as any,
    handler,
  })
    .command(FindSourcePositionModule)
    .command(FindOriginalNameModule)
    .strict(true)
    .exitProcess(true)
    .demandCommand()
    .showHelpOnFail(false, 'Specify --help for available options')
    .help()
    .parse();
}
