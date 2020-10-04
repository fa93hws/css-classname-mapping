const SEPARATOR = '(ﾟДﾟ)';
const VERSION = 'v1';

type MinifiedClassname = string;
type Value = {
  classname: string;
  source: string;
};
type ValueWithKey = Value & {
  // Serialized key with Sseparator so that we can achieve deduplication via new Set()
  uniqueKey: string;
};
export type OutputObject = {
  version: string;
  mapping: Record<MinifiedClassname, Value[]>;
};

/**
 * In order to deduplication the value based on sourceFile and originalClassname
 * Serialization and deserialization to/from string are introduced
 */
export class ClassnameMapping {
  private mapWithSerializedValue = new Map<MinifiedClassname, ValueWithKey[]>();

  private static serialize({
    classname,
    sourceFile,
  }: {
    classname: string;
    sourceFile: string;
  }): string {
    return classname + SEPARATOR + sourceFile;
  }

  private static deduplicate(valueWithKeys: ValueWithKey[]): Value[] {
    const tempMap = new Map<string, Value>();
    valueWithKeys.forEach(({ uniqueKey, ...value }) => {
      tempMap.set(uniqueKey, value);
    });
    const values: Value[] = [];
    tempMap.forEach((value) => values.push(value));
    return values;
  }

  set({
    minified,
    original,
    sourceFile,
  }: {
    minified: string;
    original: string;
    sourceFile: string;
  }): void {
    const serializedValue = ClassnameMapping.serialize({
      classname: original,
      sourceFile,
    });
    const maybeSerializedValue = this.mapWithSerializedValue.get(minified);
    const valueWithKey: ValueWithKey = {
      classname: original,
      source: sourceFile,
      uniqueKey: serializedValue,
    };
    if (maybeSerializedValue == null) {
      this.mapWithSerializedValue.set(minified, [valueWithKey]);
    } else {
      maybeSerializedValue.push(valueWithKey);
    }
  }

  toOutputObject(): OutputObject {
    const mapping: OutputObject['mapping'] = {};
    this.mapWithSerializedValue.forEach((valueWithKeys, minifiedClassname) => {
      mapping[minifiedClassname] = ClassnameMapping.deduplicate(valueWithKeys);
    });
    return {
      version: VERSION,
      mapping,
    };
  }
}
