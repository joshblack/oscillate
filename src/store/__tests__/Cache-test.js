/* @noflow */

const now = 1495549103720;
const TTL = 1000;
const SIZE = 3;
Date.now = jest.fn(() => now);

describe('Cache', () => {
  let Cache;
  let CacheEntry;

  beforeEach(() => {
    Cache = require('../Cache').default;
    CacheEntry = require('../CacheEntry').default;
  });

  it('should initialize with a default cache, size, and ttl', () => {
    const cache = new Cache(SIZE, TTL);

    expect(cache._cache).toBeInstanceOf(Map);
    expect(cache._size).toBe(SIZE);
    expect(cache._ttl).toBe(TTL);
  });

  describe('#get', () => {
    it('should return the entry if it exists for the key and is still current', () => {
      const value = 1;
      const cache = new Cache(SIZE, TTL);
      const key = 'key';
      const entry = new CacheEntry(value);

      cache.set(key, entry);

      expect(cache.get(key)).toEqual(entry);
    });

    it('should return null if the entry exists but is not current', () => {
      const value = 1;
      const cache = new Cache(SIZE, TTL);
      const key = 'key';
      const entry = new CacheEntry(value);

      cache.set(key, entry);
      Date.now = jest.fn(() => now + TTL + 1);

      expect(cache.get(key)).not.toBeDefined();
    });

    it('should return null if the entry does not exists', () => {
      const cache = new Cache(SIZE, TTL);
      expect(cache.get('foo')).not.toBeDefined();
    });
  });

  describe('#set', () => {
    it('should set the entry as the value for the given key in the cache', () => {
      const value = 1;
      const cache = new Cache(SIZE, TTL);
      const key = 'key';
      const entry = new CacheEntry(value);

      cache.set(key, entry);

      expect(cache.get(key)).toEqual(entry);
    });

    it('should re-order the given cache if the key already exists', () => {
      const cache = new Cache(SIZE, TTL);
      const entry1 = new CacheEntry(1);
      const entry2 = new CacheEntry(2);
      const entry3 = new CacheEntry(3);

      cache.set('a', entry1);
      cache.set('b', entry2);
      cache.set('c', entry3);

      const keys = [...cache._cache.keys()];
      expect(keys).toEqual(['a', 'b', 'c']);

      cache.set('a', entry1);

      expect([...cache._cache.keys()]).toEqual(['b', 'c', 'a']);
    });

    it('should delete extra entries if over the size limit', () => {
      const cache = new Cache(2, TTL);
      const entry1 = new CacheEntry(1);
      const entry2 = new CacheEntry(2);
      const entry3 = new CacheEntry(3);

      cache.set('a', entry1);
      cache.set('b', entry2);

      expect([...cache._cache.keys()]).toEqual(['a', 'b']);

      cache.set('c', entry3);

      expect([...cache._cache.keys()]).toEqual(['b', 'c']);
    });
  });

  describe('#clear', () => {
    it('should clear all existing cache entries', () => {
      const cache = new Cache(2, TTL);
      const entry1 = new CacheEntry(1);
      const entry2 = new CacheEntry(2);

      cache.set('a', entry1);
      cache.set('b', entry2);

      expect([...cache._cache.keys()]).toEqual(['a', 'b']);

      cache.clear();

      expect(cache._cache.size).toBe(0);
    });
  });

  describe('isCurrent', () => {
    let isCurrent;

    beforeEach(() => {
      isCurrent = require('../Cache').isCurrent;
    });

    it('should return true if the cacheTime plus ttl is >= the current time', () => {
      Date.now = jest.fn(() => 20);

      expect(isCurrent(10, 10)).toBe(true);

      Date.now = jest.fn(() => 20);

      expect(isCurrent(11, 10)).toBe(true);
    });

    it('should return false if the cacheTime plus ttl is >= the current time', () => {
      Date.now = jest.fn(() => 20);
      expect(isCurrent(10, 5)).toBe(false);
    });
  });
});
