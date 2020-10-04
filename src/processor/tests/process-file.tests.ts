import path from 'path';
import semver from 'semver';

import { ClassnameMapping } from '../classname-mapping';
import { processFile } from '../process-file';

describe('processFile', () => {
  it('generate version according to major version of this library', async () => {
    const mapping = new ClassnameMapping();
    await processFile(
      path.join(__dirname, 'fixtures', 'single_file.css'),
      mapping,
    );
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const thisLibraryVersion = require('../../../package.json').version;
    expect(mapping.toOutputObject().version).toEqual(
      `v${semver.parse(thisLibraryVersion)?.major}`,
    );
  });

  it('generate mapping for one file', async () => {
    const mapping = new ClassnameMapping();
    await processFile(
      path.join(__dirname, 'fixtures', 'single_file.css'),
      mapping,
    );
    expect(mapping.toOutputObject().mapping).toMatchSnapshot();
  });

  it('generate mapping for multiple files', async () => {
    const mapping = new ClassnameMapping();
    await processFile(
      path.join(__dirname, 'fixtures', 'single_file.css'),
      mapping,
    );
    await processFile(
      path.join(__dirname, 'fixtures', 'multiple_files.css'),
      mapping,
    );
    await processFile(
      path.join(__dirname, 'fixtures', 'main.d4cf772d.css'),
      mapping,
    );
    expect(mapping.toOutputObject().mapping).toMatchSnapshot();
  });

  it('aggregate mappings for multiple files', async () => {
    const mapping1 = new ClassnameMapping();
    await processFile(
      path.join(__dirname, 'fixtures', 'single_file.css'),
      mapping1,
    );
    const mapping2 = new ClassnameMapping();
    await processFile(
      path.join(__dirname, 'fixtures', 'single_file.css'),
      mapping2,
    );
    await processFile(
      path.join(__dirname, 'fixtures', 'single_file.css'),
      mapping2,
    );
    expect(mapping1.toOutputObject()).toEqual(mapping2.toOutputObject());
  });
});
