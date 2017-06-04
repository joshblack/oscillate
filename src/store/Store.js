/* @flow */

import Cache from './Cache';
import CacheEntry from './CacheEntry';

import type {Store, Subscriber} from './StoreTypes';
import type {
  NetworkLayer,
  NetworkQueryType,
  NetworkMutationType,
} from '../network/NetworkTypes';
import type {CacheConfig, Disposable} from '../environment/EnvironmentTypes';

type StoreConfig = {
  size?: number,
  ttl?: number,
};

export default class SpectrumStore implements Store {
  _cache: Cache;
  _networkLayer: NetworkLayer;

  constructor(config: StoreConfig = {}) {
    const size = config.size || 100;
    const ttl = config.ttl || 100000;
    this._cache = new Cache(size, ttl);
  }

  injectNetworkLayer(networkLayer: NetworkLayer): void {
    this._networkLayer = networkLayer;
  }

  read(
    networkQuery: NetworkQueryType,
    key: string,
    cacheConfig: CacheConfig,
  ): Promise<mixed> {
    return new Promise((resolve, reject) => {
      if (cacheConfig && !cacheConfig.forceFetch) {
        const entry = this._cache.get(key);

        if (entry) {
          resolve(entry.getValue());
          return;
        }
      }

      this._networkLayer
        .sendQuery(networkQuery)
        .then(response => {
          const entry = new CacheEntry(response);
          this._cache.set(key, entry);

          resolve(response);
        })
        .catch(reject);
    });
  }

  subscribe(
    networkQuery: NetworkQueryType,
    key: string,
    cacheConfig: CacheConfig,
    subscriber: Subscriber,
  ): Disposable {
    if (cacheConfig && !cacheConfig.forceFetch) {
      const entry = this._cache.get(key);

      if (entry) {
        const disposable = entry.addSubscriber(subscriber);
        subscriber.onSuccess(entry.getValue());
        return disposable;
      }
    }

    let isDisposed = false;
    const entry = this._cache.get(key) || new CacheEntry();
    const disposable = entry.addSubscriber(subscriber);
    const dispose = () => {
      isDisposed = true;
      disposable.dispose();
    };

    this._networkLayer
      .sendQuery(networkQuery)
      .then(response => {
        entry.setValue(response);
        this._cache.set(key, entry);
      })
      .catch(error => {
        !isDisposed && subscriber.onFailure(error);
      });

    return {dispose};
  }

  write(
    networkMutation: NetworkMutationType,
    key: string,
    cacheConfig: CacheConfig,
  ): Promise<mixed> {
    return new Promise((resolve, reject) => {
      if (cacheConfig && !cacheConfig.forceFetch) {
        const entry = this._cache.get(key);

        if (entry !== undefined && entry !== null) {
          resolve(entry.getValue());
          return;
        }
      }

      this._networkLayer
        .sendMutation(networkMutation)
        .then(response => {
          const entry = new CacheEntry(response);
          this._cache.set(key, entry);

          resolve(response);
        })
        .catch(reject);
    });
  }

  peak(key: string): mixed {
    const entry = this._cache.get(key);

    if (entry !== undefined && entry !== null) {
      return entry.getValue();
    }

    throw new Error('Unable to find entry for key: ' + key);
  }

  dehydrate(): string {
    const cache = {};

    this._cache.getEntries().forEach((value, key) => {
      cache[key] = value._value;
    });

    return JSON.stringify({
      size: this._cache._size,
      ttl: this._cache._ttl,
      cache,
    });
  }

  rehydrate(snapshot: string): void {
    try {
      const {size, ttl, cache} = JSON.parse(snapshot);
      this._cache = new Cache(size, ttl);

      Object.keys(cache).forEach(key => {
        const entry = new CacheEntry(cache[key]);
        this._cache.set(key, entry);
      });
    } catch (error) {
      throw error;
    }
  }

  getCache(): Cache {
    return this._cache;
  }
}
