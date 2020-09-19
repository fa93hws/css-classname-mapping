import { normalizePath } from '../normalize-path';

describe('normalizePath', () => {
  const fakeHome = '/User/fa93hws';
  const originalHome = process.env.HOME;

  beforeEach(() => {
    process.env.HOME = fakeHome;
  });

  afterEach(() => {
    process.env.HOME = originalHome;
  });

  it('replace ~ suffix with home', () => {
    const file = '~/work/abc';
    const normalizedPath = normalizePath(file);
    expect(normalizedPath).toEqual(`${fakeHome}/work/abc`);
  });

  it('will not replace ~ if it is not the suffix', () => {
    const file = '/abc/~/cde';
    expect(normalizePath(file)).toEqual(file);
  });

  it('keep the same path if ~ is not appearing', () => {
    const file = './abc';
    expect(normalizePath(file)).toEqual(file);
  });

  it('keep the same path if process.env.HOME is null', () => {
    delete process.env.HOME;
    const file = '~/work/abc';
    expect(normalizePath(file)).toEqual(file);
  });
});
