/* @flow */

import {format as formatParams} from './params';

export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type Primitive = void | string | number | boolean;
export type URLParams = {
  [key: string]: URLParamValue,
};
export type URLParamValue = Primitive | Array<Primitive>;

const hasLeadingSlash = (path: string): boolean => path[0] === '/';

export const format = (path: string, params: URLParams): string => {
  if (!hasLeadingSlash(path)) {
    // eslint-disable-next-line no-param-reassign
    path = '/' + path;
  }

  if (params === undefined) {
    return path;
  }

  return path + '?' + formatParams(params);
};
