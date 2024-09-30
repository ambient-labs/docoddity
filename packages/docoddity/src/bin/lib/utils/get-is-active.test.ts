import { describe, it, expect } from 'vitest';
import { getIsActive } from './get-is-active.js';

describe('getIsActive', () => {
  it('returns true when url is "/" and pageUrl is "/"', () => {
    expect(getIsActive('/', '/')).toBe(true);
  });

  it('returns false when url is "/" and pageUrl is not "/"', () => {
    expect(getIsActive('/', '/about')).toBe(false);
    expect(getIsActive('/', '/contact')).toBe(false);
  });

  it('returns true when url and pageUrl match after removing empty segments', () => {
    expect(getIsActive('/about', '/about')).toBe(true);
    expect(getIsActive('/about/', '/about')).toBe(true);
    expect(getIsActive('/about', '/about/')).toBe(true);
    expect(getIsActive('/about/', '/about/')).toBe(true);
  });

  it('returns true when url and pageUrl match after removing index from pageURL', () => {
    expect(getIsActive('/about', '/about/index')).toBe(true);
    expect(getIsActive('/about/', '/about/index')).toBe(true);
  });

  it('returns true when url and pageUrl match after removing index from url', () => {
    expect(getIsActive('/about/index', '/about')).toBe(true);
    expect(getIsActive('/about/index', '/about/')).toBe(true);
  });

  it('returns true when url and pageUrl match after removing index from pageURL and url', () => {
    expect(getIsActive('/about/index', '/about/index')).toBe(true);
  });

  it('returns false when url and pageUrl do not match after removing empty segments', () => {
    expect(getIsActive('/about', '/contact')).toBe(false);
    expect(getIsActive('/about/', '/contact')).toBe(false);
    expect(getIsActive('/about', '/contact/')).toBe(false);
    expect(getIsActive('/about/', '/contact/')).toBe(false);
  });

  it('handles URLs with multiple segments correctly', () => {
    expect(getIsActive('/blog/posts/123', '/blog/posts/123')).toBe(true);
    expect(getIsActive('/blog/posts/123/', '/blog/posts/123')).toBe(true);
    expect(getIsActive('/blog/posts/123', '/blog/posts/123/')).toBe(true);
    expect(getIsActive('/blog/posts/123/', '/blog/posts/123/')).toBe(true);
    expect(getIsActive('/blog/posts/123', '/blog/posts/456')).toBe(false);
  });

  it('handles URLs with query parameters correctly', () => {
    expect(getIsActive('/search?q=test', '/search?q=test')).toBe(true);
    expect(getIsActive('/search?q=test', '/search?q=test&sort=desc')).toBe(false);
  });

  it('handles empty pageUrl correctly', () => {
    expect(getIsActive('/', '')).toBe(false);
    expect(getIsActive('/about', '')).toBe(false);
  });
});
