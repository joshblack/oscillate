/* @flow */

import sortKeys from './sortKeys';

/**
 * Consistently hash an object of key, value pairs that are strings to a single
 * string by sorting the keys and then combining all the key, value pairs into
 * a single string.
 */
export default function hashObject(
  object: {[key: string]: string},
  delimiter: string = ',',
): string {
  return sortKeys(object).reduce((prev, key, i) => {
    const hashKey = key.toLowerCase();
    const hashValue = object[key].toLowerCase();

    if (i === 0) {
      return prev + hashKey + ':' + hashValue;
    }

    return prev + delimiter + hashKey + ':' + hashValue;
  }, '');
}
