import { join } from 'path';
import { collectClassnames, CssParser } from '../classname-helper';

describe('collectClassnames', () => {
  const parser = new CssParser();

  it('can find location of a simple css file', () => {
    const filePath = join(__dirname, 'fixtures', 'simple.css');
    const cssRoot = parser.parseFromPath(filePath);
    const classnames = collectClassnames(cssRoot);
    expect(classnames).toEqual(
      new Map([
        [
          'foo',
          {
            line: 1,
            columnStart: 0,
            columnEnd: 3,
          },
        ],
        [
          'bar',
          {
            line: 6,
            columnStart: 2,
            columnEnd: 5,
          },
        ],
        [
          'foobar',
          {
            line: 11,
            columnStart: 6,
            columnEnd: 12,
          },
        ],
      ]),
    );
  });
});
