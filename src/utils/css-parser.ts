import { Root, parse } from 'postcss';
import { readFileSync } from 'fs';

import { normalizePath } from './normalize-path';

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
