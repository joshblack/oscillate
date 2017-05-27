/* @flow */

import NetworkLayer from '../network/NetworyLayer';
import * as NetworkQuery from '../network/NetworkQuery';
import * as NetworkMutation from '../network/NetworkMutation';
import Store from '../store/Store';

import type {
  Environment,
  Result,
  QueryConfig,
  MutationConfig,
} from './SpectrumEnvironmentTypes';

type EnvironmentConfig = {
  store?: Store,
  networkLayer?: typeof NetworkLayer,
};

// eslint-disable-next-line import/no-mutable-exports
export let pendingQueries = [];

export default class SpectrumEnvironment implements Environment {
  _store: Store;
  _networkLayer: typeof NetworkLayer;

  static prefetch(config: QueryConfig): void {
    pendingQueries.push(config);
  }

  constructor(config: EnvironmentConfig = {}) {
    const networkLayer = config.networkLayer || NetworkLayer;
    const store = config.store || new Store();

    store.injectNetworkLayer(networkLayer);

    this._networkLayer = networkLayer;
    this._store = store;
  }

  peak = (config: QueryConfig): mixed => {
    const networkQuery = NetworkQuery.create(
      config.path,
      config.params,
      config.headers,
    );
    const key = NetworkQuery.hash(networkQuery);
    return this._store.peak(key);
  };

  sendQuery = (config: QueryConfig): Result<mixed> => {
    const {cacheConfig = {}, ...queryConfig} = config;
    const networkQuery = NetworkQuery.create(
      queryConfig.path,
      queryConfig.params,
      queryConfig.headers,
    );
    const key = NetworkQuery.hash(networkQuery);

    if (config.onSuccess && config.onFailure) {
      const subscriber = {
        onSuccess: config.onSuccess,
        onFailure: config.onFailure,
      };
      return this._store.subscribe(networkQuery, key, cacheConfig, subscriber);
    }

    return this._store.read(networkQuery, key, cacheConfig);
  };

  sendMutation = (config: MutationConfig): Promise<mixed> => {
    const {cacheConfig = {}, ...mutationConfig} = config;
    const networkMutation = NetworkMutation.create(mutationConfig);
    const key = NetworkMutation.hash(networkMutation);

    return this._store.write(networkMutation, key, cacheConfig);
  };

  preload = (): Promise<mixed> => {
    const pendingRequests = pendingQueries.map(this.sendQuery);
    pendingQueries = [];
    return Promise.all(pendingRequests).then(() => this.dehydrate());
  };

  dehydrate(): string {
    return this._store.dehydrate();
  }

  rehydrate(snapshot: string): void {
    return this._store.rehydrate(snapshot);
  }
}
