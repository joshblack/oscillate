/* @flow */

import type {
  CacheConfig,
  Disposable,
} from '../environment/SpectrumEnvironmentTypes';
import type {
  NetworkQueryType,
  NetworkMutationType,
} from '../network/NetworkTypes';

export type Subscriber = {
  onSuccess: () => void,
  onFailure: () => void,
};

export interface Store {
  read(
    networkQuery: NetworkQueryType,
    key: string,
    cacheConfig: CacheConfig,
  ): Promise<mixed>,

  subscribe(
    networkQuery: NetworkQueryType,
    key: string,
    cacheConfig: CacheConfig,
    subscriber: Subscriber,
  ): Disposable,

  write(
    networkMutation: NetworkMutationType,
    key: string,
    cacheConfig: CacheConfig,
  ): Promise<mixed>,

  peak(key: string): mixed,

  serialize(): string,
  deserialize(source: string): void,
}
