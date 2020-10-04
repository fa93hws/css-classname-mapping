import { Location } from '../location';

describe('fromNodeSource', () => {
  it('convert the source to location', () => {
    const location = Location.fromPostcssNodeSource({
      start: { line: 1, column: 2 },
      end: { line: 2, column: 4 },
    });
    expect(location.line).toEqual(1);
    expect(location.column).toEqual(1);
  });
});

describe('serializeKey', () => {
  it('join the line and number', () => {
    const key = new Location({ line: 1, column: 2 }).serialize();
    expect(key).toEqual('1:2');
  });
});

describe('deserializeKey', () => {
  it('deserialize the given key', () => {
    const key = '1:2';
    const location = Location.fromSerializedKey(key);
    expect(location.line).toEqual(1);
    expect(location.column).toEqual(2);
  });
});
