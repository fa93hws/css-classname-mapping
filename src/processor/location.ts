type Range = {
  start: number;
  end: number;
};

/**
 * To be consisitent with source-map
 * line starts from 1 but column starts from 0
 */
export class Location {
  readonly line: Range;

  readonly column: Range;

  private constructor({ line, column }: { line: Range; column: Range }) {
    this.line = line;
    this.column = column;
  }

  offset({ line, column }: { line: number; column: number }): Location {
    return new Location({
      line: {
        start: this.line.start + line,
        end: this.line.end + line,
      },
      column: {
        start: this.column.start + column,
        end: this.column.end + column,
      },
    });
  }

  isOnSameline(): boolean {
    return this.line.start === this.line.end;
  }

  static fromNodeSource(source: {
    start?: { line: number; column: number };
    end?: { line: number; column: number };
  }): Location {
    if (source.end == null || source.start == null) {
      throw new Error('fail to find classname position');
    }
    return new Location({
      line: {
        start: source.start.line,
        end: source.end.line,
      },
      /* column from postcss starts from 1
       * while we want it starts from 0
       * according to source-map
       */
      column: {
        start: source.start.column - 1,
        end: source.end.column - 1,
      },
    });
  }
}
