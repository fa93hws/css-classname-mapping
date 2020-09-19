import { EOL } from 'os';
import { findSourceMap } from '../process-file';

describe('findSourceMap', () => {
  it('should find the source mapping url in css file', () => {
    const content = [
      '[dir] .HHNCVg{padding:8px}',
      '/*# sourceMappingURL=2f8c03e21afbe2d0c288.2.css.map*/',
    ].join(EOL);
    const sourcemapPath = findSourceMap(content).expect(
      'unable to find sourcemap url',
    );
    expect(sourcemapPath).toEqual('2f8c03e21afbe2d0c288.2.css.map');
  });
});
