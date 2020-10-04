import { EOL } from 'os';
import { join } from 'path';

import {
  generateSelectorToLocation,
  generateLocationToSelector,
} from '../selector-location';
import { CssParser } from '../../utils/css-parser';

describe('selector and location mapping', () => {
  const parser = new CssParser();

  it('generate selector to location mapping', () => {
    const filePath = join(__dirname, 'fixtures', 'simple.css');
    const cssRoot = parser.parseFromPath(filePath);
    const classnames = generateSelectorToLocation({
      cacheKey: filePath,
      rootNode: cssRoot,
    });
    expect(classnames).toEqual(
      new Map([
        ['.foo', '1:0'],
        ['ul .bar', '6:0'],
        ['.bar, .foobar', '11:0'],
        [`.bar,${EOL}.baz`, '16:0'],
        ['ul:first-child', '21:2'],
        ['.bar:last-child > .baz:nth-child(2)', '25:0'],
        ['.a', '29:0'],
        ['.b', '29:18'],
      ]),
    );
  });

  it('generate location to classname mapping', () => {
    const filePath = join(__dirname, 'fixtures', 'simple.css');
    const cssRoot = parser.parseFromPath(filePath);
    const classnames = generateLocationToSelector({
      cacheKey: filePath,
      rootNode: cssRoot,
    });
    expect(classnames).toEqual(
      new Map([
        ['1:0', '.foo'],
        ['6:0', 'ul .bar'],
        ['11:0', '.bar, .foobar'],
        ['16:0', `.bar,${EOL}.baz`],
        ['21:2', 'ul:first-child'],
        ['25:0', '.bar:last-child > .baz:nth-child(2)'],
        ['29:0', '.a'],
        ['29:18', '.b'],
      ]),
    );
  });
});
