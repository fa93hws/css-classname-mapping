import { ClassnameMapping } from '../classname-mapping';

describe('ClassnameMapping', () => {
  it('produce expected object when given values', () => {
    const mapping = new ClassnameMapping();
    mapping.set({
      minified: 'minified_1',
      original: 'original_1',
      sourceFile: 'source_1',
    });
    mapping.set({
      minified: 'minified_2',
      original: 'original_2',
      sourceFile: 'source_2',
    });
    expect(mapping.toOutputObject()).toEqual({
      version: 'v1',
      mapping: {
        minified_1: [
          {
            classname: 'original_1',
            source: 'source_1',
          },
        ],
        minified_2: [
          {
            classname: 'original_2',
            source: 'source_2',
          },
        ],
      },
    });
  });

  it('deduplicated same values', () => {
    const mapping = new ClassnameMapping();
    mapping.set({
      minified: 'minified_1',
      original: 'original_1',
      sourceFile: 'source_1',
    });
    mapping.set({
      minified: 'minified_1',
      original: 'original_1',
      sourceFile: 'source_1',
    });
    expect(mapping.toOutputObject()).toEqual({
      version: 'v1',
      mapping: {
        minified_1: [
          {
            classname: 'original_1',
            source: 'source_1',
          },
        ],
      },
    });
  });
});
