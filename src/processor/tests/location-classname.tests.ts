import { join } from 'path';

import { findSourceMap } from '../find-sourcemap';
import { CssParser } from '../../utils/css-parser';
import {
  serializeKey,
  deserializeKey,
  getLocationToClassnameFromSourcemap,
} from '../location-classname';

describe('serializeKey', () => {
  it('join the line and number', () => {
    const key = serializeKey({ line: 1, column: 2 });
    expect(key).toEqual('1:2');
  });
});

describe('deserializeKey', () => {
  it('deserialize the given key', () => {
    const key = '1:2';
    expect(deserializeKey(key)).toEqual({
      line: 1,
      column: 2,
    });
  });
});

describe('getLocationsFromSourcemap', () => {
  it('generates the map correctly for single file source', () => {
    const cssFilePath = join(__dirname, 'fixtures', 'single_file.css');
    const { sourcemap } = findSourceMap(cssFilePath).unwrap();
    const locationToClassnames = getLocationToClassnameFromSourcemap(
      sourcemap.raw,
      new CssParser(),
    );
    expect(
      locationToClassnames.get(
        'webpack:///pages/dummy/fakes/fake_component.css',
      ),
    ).toEqual(
      new Map([
        ['1:0', 'fakeComponent'],
        ['5:0', 'foo'],
        ['10:0', 'ele'],
        ['10:7', 'gold'],
        ['14:0', 'bar'],
        ['18:3', 'baz'],
        ['22:0', 'apple'],
        ['23:0', 'boy'],
        ['23:4', 'cat'],
        ['23:10', 'dog'],
      ]),
    );
  });

  it('generates the map correctly for multiple files source', () => {
    const cssFilePath = join(__dirname, 'fixtures', 'multiple_files.css');
    const { sourcemap } = findSourceMap(cssFilePath).unwrap();
    const locationToClassnames = getLocationToClassnameFromSourcemap(
      sourcemap.raw,
      new CssParser(),
    );
    expect(locationToClassnames).toEqual(
      new Map([
        ['webpack:///pages/dummy/fakes/bar.css', new Map([['3:0', 'bar']])],
        ['webpack:///pages/dummy/fakes/foo.css', new Map([['1:0', 'foo']])],
        [
          'webpack:///pages/dummy/fakes/fake_component2.css',
          new Map([['5:0', 'fakeComponent']]),
        ],
      ]),
    );
  });
});
