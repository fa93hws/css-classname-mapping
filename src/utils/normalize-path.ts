export function normalizePath(path: string): string {
  if (process.env.HOME == null) {
    return path;
  }
  return path.startsWith('~') ? path.replace('~', process.env.HOME) : path;
}
