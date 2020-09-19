import { Root, parse } from 'postcss';
import { readFileSync } from 'fs';
import * as selectorParser from 'postcss-selector-parser';
import { normalizePath } from '../utils/normalize-path';

type Position = {
  line: number;
  columnStart: number;
  columnEnd: number;
};

export class CssParser {
  private cache = new Map<string, Root>();

  parseFromContent({
    content,
    cacheKey,
  }: {
    content: string;
    cacheKey?: string;
  }): Root {
    const node = parse(content);
    if (cacheKey != null) {
      this.cache.set(cacheKey, node);
    }
    return node;
  }

  parseFromPath(filePath: string): Root {
    const normalizedPath = normalizePath(filePath);
    const cssFileContent = readFileSync(normalizedPath, {
      encoding: 'utf-8',
    });
    return this.parseFromContent({
      content: cssFileContent,
      cacheKey: normalizedPath,
    });
  }
}

function getFinalPosition(
  rulePosition: { line: number; column: number },
  selectorPosition: Position,
): Position {
  // Both line and column starts from 1 from postcss
  // but source map want line starts from 1 and column starts from 0
  return {
    line: rulePosition.line + selectorPosition.line - 1,
    columnStart: rulePosition.column + selectorPosition.columnStart - 2,
    columnEnd: rulePosition.column + selectorPosition.columnEnd - 2,
  };
}

export function collectClassnames(root: Root): Map<string, Position> {
  const classnames = new Map<string, Position>();
  const transform = (selectors: selectorParser.Root) => {
    const subPositions = new Map<string, Position>();
    selectors.walkClasses((selector) => {
      if (
        selector.source == null ||
        selector.source.end == null ||
        selector.source.start == null
      ) {
        throw new Error('fail to find classname position');
      }
      if (selector.value == null) {
        throw new Error('selector.value is empty');
      }
      if (selector.source.start.line !== selector.source.end.line) {
        throw new Error('classname is in multiple line?');
      }
      subPositions.set(selector.value, {
        line: selector.source.start.line,
        columnStart: selector.source.start.column,
        columnEnd: selector.source.end.column,
      });
    });
    return subPositions;
  };

  root.walkRules((rule) => {
    const subPositions = selectorParser(transform).transformSync(rule.selector);
    subPositions.forEach((position, classname) => {
      if (classnames.has(classname)) {
        return;
      }
      if (rule.source?.start == null) {
        throw new Error('rule.source.start is empty');
      }
      classnames.set(classname, getFinalPosition(rule.source?.start, position));
    });
  });
  return classnames;
}
