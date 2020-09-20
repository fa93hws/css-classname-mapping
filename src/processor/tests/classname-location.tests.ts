import { join } from 'path';

import { generateClassnameLocations } from '../classname-location';
import { CssParser } from '../../utils/css-parser';

describe('collectClassnames', () => {
  const parser = new CssParser();

  it('can find location of a simple css file', () => {
    const filePath = join(__dirname, 'fixtures', 'simple.css');
    const cssRoot = parser.parseFromPath(filePath);
    const classnames = generateClassnameLocations({
      path: filePath,
      rootNode: cssRoot,
    });
    expect(classnames).toEqual(
      new Map([
        [
          'foo',
          {
            line: {
              start: 1,
              end: 1,
            },
            column: {
              start: 0,
              end: 3,
            },
          },
        ],
        [
          'bar',
          {
            line: {
              start: 6,
              end: 6,
            },
            column: {
              start: 3,
              end: 6,
            },
          },
        ],
        [
          'foobar',
          {
            line: {
              start: 11,
              end: 11,
            },
            column: {
              start: 6,
              end: 12,
            },
          },
        ],
      ]),
    );
  });
});
