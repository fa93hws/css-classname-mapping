import type { Root } from 'postcss';

import { Location } from './location';

type Selector = string;
type SerializedLocation = string;
export type SelectorToLocation = Map<Selector, SerializedLocation>;
export type LocationToSelector = Map<SerializedLocation, Selector>;

// filepath -> selectorsLocations
const cache = new Map<string, SelectorToLocation>();

export function generateLocationToSelector({
  cacheKey,
  rootNode,
}: {
  cacheKey: string;
  rootNode: Root;
}): LocationToSelector {
  const cachedValue = cache.get(cacheKey);
  if (cachedValue != null) {
    return cachedValue;
  }

  const output = new Map<string, SerializedLocation>();
  rootNode.walkRules((rule) => {
    if (rule.source == null) {
      throw new Error('source should not be empty');
    }
    output.set(
      Location.fromPostcssNodeSource(rule.source).serialize(),
      rule.selector,
    );
  });

  cache.set(cacheKey, output);
  return output;
}

export function generateSelectorToLocation({
  cacheKey,
  rootNode,
}: {
  cacheKey: string;
  rootNode: Root;
}): SelectorToLocation {
  const out = new Map<SerializedLocation, Selector>();
  generateLocationToSelector({ cacheKey, rootNode }).forEach(
    (selector, location) => {
      out.set(selector, location);
    },
  );
  return out;
}
