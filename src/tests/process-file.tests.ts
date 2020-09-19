import { EOL } from 'os';
import { processFile, findSourceMapPath } from '../process-file';

describe('findSourceMapPath', () => {
  it('can find the source mapping url in css file', () => {
    const content = [
      '[dir] .HHNCVg{padding:8px}',
      '/*# sourceMappingURL=2f8c03e21afbe2d0c288.2.css.map*/',
    ].join(EOL);
    const sourcemapPath = findSourceMapPath(content).expect(
      'unable to find sourcemap url',
    );
    expect(sourcemapPath).toEqual('2f8c03e21afbe2d0c288.2.css.map');
  });
});

describe('processFile', () => {
  const existsSync = jest.fn();
  const readFileSync = jest.fn();

  beforeEach(() => {
    existsSync.mockRestore();
    readFileSync.mockRestore();
  });

  it('can read the sourcemap content based on css file', () => {
    const cssFilePath = 'a.css';
    const sourcemapPath = '2f8c03e21afbe2d0c288.2.css.map';
    const cssContent = [
      '[dir] .HHNCVg{padding:8px}',
      '/*# sourceMappingURL=2f8c03e21afbe2d0c288.2.css.map*/',
    ].join(EOL);
    const actualSourcemapContent = 'hello world';

    readFileSync
      .mockReturnValueOnce(cssContent)
      .mockReturnValueOnce(actualSourcemapContent);
    existsSync.mockReturnValue(true);

    const gotSourcemapContent = processFile(cssFilePath, {
      existsSync,
      readFileSync,
    }).unwrap();

    expect(gotSourcemapContent).toEqual(actualSourcemapContent);
    expect(readFileSync.mock.calls).toEqual([
      [cssFilePath, { encoding: 'utf-8' }],
      [sourcemapPath, { encoding: 'utf-8' }],
    ]);
    expect(existsSync).toHaveBeenCalledTimes(1);
    expect(existsSync).toHaveBeenCalledWith(sourcemapPath);
  });
});
