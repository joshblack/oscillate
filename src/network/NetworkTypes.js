/* @flow */

import type {URLParams} from '../url';

export type NetworkQueryType = {
  id: string,
  path: string,
  uri: string,
  method: 'GET',
  params?: URLParams,
  headers?: {[key: string]: string},
  query?: string,
};

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type NetworkMutationType = {
  id: string,
  path: string,
  uri: string,
  method: MutationMethod,
  params?: URLParams,
  headers?: {[key: string]: string},
  query?: string,
  body?: string,
};

export type CreateNetworkMutationConfig = {
  path: string,
  method?: MutationMethod,
  params?: URLParams,
  headers?: {[key: string]: string},
  body?: {[key: string]: mixed},
};

export interface NetworkLayer {
  sendQuery(networkQuery: NetworkQueryType): Promise<mixed>,
  sendMutation(mutationQuery: NetworkMutationType): Promise<mixed>,
  // TODO: sendSubscription
}
