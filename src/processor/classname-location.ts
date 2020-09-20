import { Root } from 'postcss';
import * as selectorParser from 'postcss-selector-parser';

import { Location } from './location';

// classname -> location
export type ClassnameLocation = Map<string, Location>;

function selectorTransformer(
  selectors: selectorParser.Root,
): ClassnameLocation {
  const localLocations = new Map<string, Location>();

  selectors.walkClasses((selector) => {
    if (selector.value == null) {
      throw new Error('selector.value is empty');
    }
    if (localLocations.has(selector.value)) {
      return;
    }
    if (selector.source == null) {
      throw new Error('source should not be null');
    }
    const localLocation = Location.fromNodeSource(selector.source);
    if (!localLocation.isOnSameline()) {
      throw new Error('classname is in multiple line?');
    }
    localLocations.set(
      selector.value,
      Location.fromNodeSource(selector.source),
    );
  });

  return localLocations;
}

// filepath -> classnameLocation
const cache = new Map<string, ClassnameLocation>();

export function generateClassnameLocations({
  path,
  rootNode,
}: {
  path: string;
  rootNode: Root;
}): ClassnameLocation {
  const cachedValue = cache.get(path);
  if (cachedValue != null) {
    return cachedValue;
  }

  const globalLocations = new Map<string, Location>();
  rootNode.walkRules((rule) => {
    const localLocations = selectorParser(selectorTransformer).transformSync(
      rule.selector,
    );
    localLocations.forEach((localLocation, classname) => {
      if (globalLocations.has(classname)) {
        return;
      }
      if (rule.source == null) {
        throw new Error('source should not be empty');
      }
      const parentLocation = Location.fromNodeSource(rule.source);
      const globalLocation = localLocation.offset({
        line: parentLocation.line.start - 1,
        column: parentLocation.column.start,
      });
      globalLocations.set(classname, globalLocation);
    });
  });

  return globalLocations;
}
