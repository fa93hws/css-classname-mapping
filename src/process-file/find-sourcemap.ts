import { Ok, Err, Result } from 'ts-results';

export function findSourceMap(content: string): Result<string, null> {
  const regex = /^\/\*\# sourceMappingURL=(.+)\*\//m;
  const match = regex.exec(content);
  if (match == null || match.length !== 2) {
    return Err(null);
  }
  return Ok(match[1]);
}