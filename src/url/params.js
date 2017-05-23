/* @flow */

import invariant from 'fbjs/lib/invariant';
import sortKeys from '../utilities/sortKeys';

import type {URLParams, URLParamValue} from './';

const formatValue = (value: URLParamValue): string => {
  if (Array.isArray(value)) {
    return value.reduce((prev, curr, i) => {
      const separator = i === 0 ? '' : ',';

      invariant(
        !Array.isArray(curr),
        'Unexpected nested array received for a URL Parameter value. ' +
          'Expected one of: [string, number, boolean, void], instead ' +
          'received: [%s]',
        curr,
      );

      return prev + separator + formatValue(curr);
    }, '');
  }

  invariant(
    !value || typeof value !== 'object',
    'Unexpected object received for a URL Parameter value. ' +
      'Expected one of: [string, number, boolean, array, void], instead ' +
      'received: %s',
    JSON.stringify(value),
  );

  return window.encodeURIComponent(value);
};

export const format = (params?: URLParams): string => {
  if (params === undefined) {
    return '';
  }

  return sortKeys(params).reduce((prevQuery, key, i) => {
    // If we're starting off on the first key, our seperator should be a blank
    // string versus using `&` for combinding multiple parameters.
    const separator = i === 0 ? '' : '&';

    // Construct our query by encoding both the key and valid of our parameter
    // $FlowFixMe
    const query = `${encodeURIComponent(key)}=${formatValue(params[key])}`;

    // Append this new query to the previous query string using our seperator
    return prevQuery + separator + query;
  }, '');
};
