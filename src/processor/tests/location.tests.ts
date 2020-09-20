import { Location } from '../location';

describe('Location', () => {
  describe('fromNodeSource', () => {
    it('convert the source to location', () => {
      const location = Location.fromNodeSource({
        start: { line: 1, column: 2 },
        end: { line: 2, column: 4 },
      });
      expect(location.line).toEqual({ start: 1, end: 2 });
      expect(location.column).toEqual({ start: 1, end: 3 });
    });
  });

  describe('isOnSameLine', () => {
    it('is on same line if lines are same on start and end', () => {
      const location = Location.fromNodeSource({
        start: { line: 1, column: 2 },
        end: { line: 1, column: 4 },
      });
      expect(location.isOnSameline()).toEqual(true);
    });

    it('is not on same line if lines are different on start and end', () => {
      const location = Location.fromNodeSource({
        start: { line: 1, column: 2 },
        end: { line: 2, column: 4 },
      });
      expect(location.isOnSameline()).toEqual(false);
    });
  });

  describe('offset', () => {
    it('offset the line and column correctly', () => {
      const location = Location.fromNodeSource({
        start: { line: 1, column: 2 },
        end: { line: 2, column: 4 },
      });
      const result = location.offset({ line: 2, column: 2 });
      expect(result.column).toEqual({ start: 3, end: 5 });
      expect(result.line).toEqual({ start: 3, end: 4 });
    });
  });
});
