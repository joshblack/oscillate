/* @flow */

import {format as formatParams} from '../url/params';
import hashObject from '../utilities/hashObject';

import type {
  NetworkMutationType,
  CreateNetworkMutationConfig,
} from './NetworkTypes';

let _nextMutationId = 0;

export const create = ({
  path,
  method,
  params,
  headers,
  body,
}: CreateNetworkMutationConfig): NetworkMutationType => {
  const id = 'm' + _nextMutationId++;
  const networkMutation: NetworkMutationType = {
    id,
    path,
    method: 'POST',
    uri: path,
  };

  if (method !== undefined) {
    networkMutation.method = method;
  }

  if (params !== undefined) {
    networkMutation.params = params;
    networkMutation.query = formatParams(params);
    networkMutation.uri += '?' + networkMutation.query;
  }

  if (headers !== undefined) {
    networkMutation.headers = headers;
  }

  if (body !== undefined) {
    if (body instanceof FormData) {
      networkMutation.body = body;
    } else {
      networkMutation.body = JSON.stringify(body);
    }
  }

  return networkMutation;
};

export const hash = (networkMutation: NetworkMutationType): string => {
  let output = `${networkMutation.method} ${networkMutation.uri}`;

  if (networkMutation.headers !== undefined) {
    output += ' ' + hashObject(networkMutation.headers);
  }

  if (networkMutation.body !== undefined) {
    output += ' ' + networkMutation.body;
  }

  return output;
};
