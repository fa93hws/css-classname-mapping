/**
 * To be consisitent with source-map
 * line starts from 1 but column starts from 0
 */
export class Location {
  readonly line: number;

  readonly column: number;

  constructor({ line, column }: { line: number; column: number }) {
    this.line = line;
    this.column = column;
  }

  static fromPostcssNodeSource(source: {
    start?: { line: number; column: number };
    end?: { line: number; column: number };
  }): Location {
    if (source.end == null || source.start == null) {
      throw new Error('fail to find classname position');
    }
    return new Location({
      line: source.start.line,
      /* column from postcss starts from 1
       * while we want it starts from 0
       * according to source-map
       */
      column: source.start.column - 1,
    });
  }

  static fromSerializedKey(key: string): Location {
    const regex = /^(\d+):(\d+)$/;
    const match = regex.exec(key);
    if (match == null || match.length !== 3) {
      throw new Error(`fail to deserialize key ${key}`);
    }
    const [, lineStr, columnStr] = match;
    const line = parseInt(lineStr, 10);
    if (Number.isNaN(line)) {
      throw new Error(`failed to parse line ${lineStr}`);
    }
    const column = parseInt(columnStr, 10);
    if (Number.isNaN(column)) {
      throw new Error(`failed to parse column ${column}`);
    }
    return new Location({ line, column });
  }

  serialize(): string {
    return `${this.line}:${this.column}`;
  }
}
