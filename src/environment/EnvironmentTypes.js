/* @flow */

import type {
  NetworkQueryType,
  CreateNetworkMutationConfig,
} from '../network/NetworkTypes';
import type {Subscriber} from '../store/StoreTypes';

export type Result<T> = Promise<T> | Disposable;

export type Disposable = {
  dispose: () => void,
};

export type CacheConfig = {
  forceFetch?: boolean,
  ttl?: number,
};

export type QueryConfig = NetworkQueryType &
  Subscriber & {cacheConfig?: CacheConfig};

export type MutationConfig = CreateNetworkMutationConfig &
  Subscriber & {cacheConfig?: CacheConfig};

export interface Environment {
  sendQuery(config: QueryConfig): Result<mixed>,
  sendMutation(config: MutationConfig): Result<mixed>,
  // TODO: sendSubscription

  /**
   * Prefetch is used in a similar fashion to in the browser, where it should
   * signify that a given query might be needed. In other words, it's a way to
   * enqueue a query operation that will then be flushed when preload is
   * executed.
   */
  static prefetch(config: QueryConfig): Promise<mixed>,

  /**
   * Preload also tries to mirror the browser usage of the term, in that
   * invoking this method will force the Environment to load all of the query
   * operations that have been enqueued with `prefetch`.
   */
  preload(): Promise<mixed>,
}
