import { join } from 'path';
import { readFileSync } from 'fs';
import { findSourceMap } from '../find-sourcemap';

describe('CssProcessor', () => {
  const fakeExistsSync = jest.fn();
  const fakeReadFileSync = jest.fn();

  beforeEach(() => {
    fakeExistsSync.mockRestore();
    fakeReadFileSync.mockRestore();
  });

  it('can read the sourcemap content based on css file', () => {
    const cssFilePath = join(__dirname, 'fixtures', 'main.d4cf772d.css');
    const sourcemapPath = join(__dirname, 'fixtures', 'main.d4cf772d.css.map');
    const cssContent = readFileSync(cssFilePath, { encoding: 'utf-8' });
    const actualSourcemapContent = readFileSync(sourcemapPath, {
      encoding: 'utf-8',
    });

    fakeReadFileSync.mockImplementation((filePath) => {
      if (filePath === cssFilePath) {
        return cssContent;
      }
      if (filePath === sourcemapPath) {
        return actualSourcemapContent;
      }
      throw new Error(`filePath ${filePath} is not expected`);
    });
    fakeExistsSync.mockImplementation((filePath) =>
      [cssFilePath, sourcemapPath].includes(filePath),
    );

    const { css, sourcemap } = findSourceMap(cssFilePath, {
      existsSync: fakeExistsSync,
      readFileSync: fakeReadFileSync,
    }).unwrap();

    expect(sourcemap).toEqual({
      path: sourcemapPath,
      raw: JSON.parse(actualSourcemapContent),
    });
    expect(css).toEqual({
      path: cssFilePath,
      content: cssContent,
    });
  });
});
