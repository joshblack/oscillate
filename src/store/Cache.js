/* @flow */

import CacheEntry from './CacheEntry';

export default class Cache {
  _cache: Map<string, CacheEntry>;
  _size: number;
  _ttl: number;

  constructor(size: number = 100, ttl: number = 30000) {
    this._cache = new Map();
    this._size = size;
    this._ttl = ttl;
  }

  clear(): void {
    this._cache.clear();
  }

  get(key: string): ?CacheEntry {
    this._cache.forEach((entry, cacheKey) => {
      if (!isCurrent(entry.getCacheTime(), this._ttl)) {
        this._cache.delete(cacheKey);
      }
    });

    return this._cache.get(key);
  }

  set(key: string, entry: CacheEntry): void {
    this._cache.delete(key);
    this._cache.set(key, entry);
    if (this._cache.size > this._size) {
      const firstKey = this._cache.keys().next();
      if (!firstKey.done) {
        this._cache.delete(firstKey.value);
      }
    }
  }
}

/**
 * Determine whether a response fetched at `fetchTime` is still valid given
 * some `ttl`.
 */
export function isCurrent(cacheTime: number, ttl: number): boolean {
  return cacheTime + ttl >= Date.now();
}
