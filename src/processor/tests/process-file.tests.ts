import { EOL } from 'os';
import { join } from 'path';
import { readFileSync } from 'fs';
import { CssProcessor, findSourceMapPath } from '../css-processor';

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

    const { css, sourcemap, sourceIndex } = CssProcessor.fromCssFile(
      cssFilePath,
      {
        existsSync: fakeExistsSync,
        readFileSync: fakeReadFileSync,
      },
    ).unwrap();

    expect(sourcemap).toEqual(JSON.parse(actualSourcemapContent));
    expect(css).toEqual(cssContent);
    expect(sourceIndex).toEqual(
      new Map([
        ['webpack:///cart.css', 0],
        ['webpack:///carousel.css', 1],
        ['webpack:///home.css', 2],
        ['webpack:///dish-grid.css', 3],
        ['webpack:///menu-items.css', 4],
        ['webpack:///menu.css', 5],
        ['webpack:///category.css', 6],
        ['webpack:///global.css', 7],
      ]),
    );
  });
});
