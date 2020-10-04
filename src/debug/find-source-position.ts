// import * as Yargs from 'yargs';

// import { findSourceMap } from '../processor/find-sourcemap';
// import { getSourceAt, print } from './shared';

// type CliArgs = {
//   cssFilePath: string;
//   line: number;
//   column: number;
// };

// async function handler({ cssFilePath, line, column }: CliArgs): Promise<void> {
//   const { sourcemap } = findSourceMap(cssFilePath).unwrap();
//   const sourceLocation = await getSourceAt({
//     line,
//     column,
//     rawSourcemap: sourcemap.raw,
//   });
//   print(sourceLocation);
// }

// export const FindSourcePositionModule: Yargs.CommandModule<unknown, CliArgs> = {
//   command: 'find-source',
//   describe: 'find the source code based on the position',
//   builder: (): Yargs.Argv<CliArgs> =>
//     Yargs.option('cssFilePath', {
//       demandOption: true,
//       type: 'string',
//       describe: 'path to css file',
//     })
//       .option('line', {
//         demandOption: true,
//         type: 'number',
//         describe: 'line number',
//       })
//       .option('column', {
//         demandOption: true,
//         type: 'number',
//         describe: 'column number',
//       }),
//   handler,
// };
