/* @flow */

import {format as formatParams} from '../url/params';
import hashObject from '../utilities/hashObject';

import type {NetworkQueryType} from './NetworkTypes';
import type {URLParams} from '../url';

let _nextQueryId = 0;

/**
 * Simple abstraction over what represents a `Query`.
 *
 * In our case, a query is constructed with a given path and params.
 * We use these parameters together to construct an initial url, as well as
 * decorate the POJO with some id information, as well as debug information.
 */
export const create = (
  path: string,
  params?: URLParams,
  headers?: {[key: string]: string},
): NetworkQueryType => {
  const id = 'q' + _nextQueryId++;
  const networkQuery: NetworkQueryType = {
    id,
    path,
    method: 'GET',
    uri: path,
  };

  if (params !== undefined) {
    networkQuery.params = params;
    networkQuery.query = formatParams(params);
    networkQuery.uri += '?' + networkQuery.query;
  }

  if (headers !== undefined) {
    networkQuery.headers = headers;
  }

  return networkQuery;
};

export const hash = (networkQuery: NetworkQueryType): string => {
  let output = `${networkQuery.method} ${networkQuery.uri}`;

  if (networkQuery.headers !== undefined) {
    output += ' ' + hashObject(networkQuery.headers);
  }

  return output;
};
