import selectorParser from 'postcss-selector-parser';
import once from 'lodash.once';

const getTransformer = once(() =>
  selectorParser((selectors: selectorParser.Root): string[] => {
    const classnames: string[] = [];
    selectors.walkClasses((selector) => {
      if (selector.value == null) {
        throw new Error('selector.value is empty');
      }
      classnames.push(selector.value);
    });
    return classnames;
  }),
);

type MinifiedClassname = string;
type OriginalClassname = string;

function pairClassnames({
  minified,
  original,
}: {
  minified: MinifiedClassname[];
  original: OriginalClassname[];
}): Map<MinifiedClassname, Set<OriginalClassname>> {
  const output = new Map<MinifiedClassname, Set<OriginalClassname>>();
  if (original.length !== minified.length) {
    throw new Error(
      `unbalanced classnames in selector. minified: ${minified}, original: ${original}`,
    );
  }
  for (let idx = 0; idx < original.length; idx += 1) {
    const originalClassname = original[idx];
    const minifiedClassname = minified[idx];
    const maybeValue = output.get(minifiedClassname);
    if (maybeValue != null) {
      maybeValue.add(originalClassname);
    } else {
      output.set(minifiedClassname, new Set([originalClassname]));
    }
  }
  return output;
}

export function pairSelectors({
  minified,
  original,
}: {
  minified: string;
  original: string;
}): Map<MinifiedClassname, Set<OriginalClassname>> {
  const transformer = getTransformer();
  const minifiedClassnames = transformer.transformSync(minified);
  const originalClassnames = transformer.transformSync(original);
  return pairClassnames({
    original: originalClassnames,
    minified: minifiedClassnames,
  });
}
