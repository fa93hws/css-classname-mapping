import { EOL } from 'os';
import { pairSelectors } from '../selectors-pairing';

describe('find classname mapping by pairing selectors', () => {
  it('pairs on classname', () => {
    const minified = '.xi2_sZ';
    const original = '.foo';
    const result = pairSelectors({ minified, original });
    expect(result).toEqual(new Map([['xi2_sZ', new Set(['foo'])]]));
  });

  it('pairs on classnames', () => {
    const minified = '.xi2_sZ .bs_io7';
    const original = '.foo .bar';
    const result = pairSelectors({ minified, original });
    expect(result).toEqual(
      new Map([
        ['xi2_sZ', new Set(['foo'])],
        ['bs_io7', new Set(['bar'])],
      ]),
    );
  });

  it('pairs on classnames with presdo selectors', () => {
    const minified = '.xi2_sZ:focus > .bs_io7:last-child';
    const original = '.foo:focus > .bar:focus';
    const result = pairSelectors({ minified, original });
    expect(result).toEqual(
      new Map([
        ['xi2_sZ', new Set(['foo'])],
        ['bs_io7', new Set(['bar'])],
      ]),
    );
  });

  it('pairs on classnames with duplication', () => {
    const minified = '.xi2_sZ:focus > .xi2_sZ:last-child';
    const original = '.foo:focus > .bar:focus';
    const result = pairSelectors({ minified, original });
    expect(result).toEqual(new Map([['xi2_sZ', new Set(['foo', 'bar'])]]));
  });

  it('pairs on classnames on multiple lines', () => {
    const minified = ['.xi2_sZ,', '.bs_io7'].join(EOL);
    const original = '.foo, .bar';
    const result = pairSelectors({ minified, original });
    expect(result).toEqual(
      new Map([
        ['xi2_sZ', new Set(['foo'])],
        ['bs_io7', new Set(['bar'])],
      ]),
    );
  });

  it('pairs without classnames', () => {
    const minified = 'ul > li';
    const original = 'ul > li';
    const result = pairSelectors({ minified, original });
    expect(result).toEqual(new Map());
  });
});
