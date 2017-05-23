/* @flow */

import fetch from 'fbjs/lib/fetchWithRetries';

import type {
  NetworkLayer,
  NetworkQueryType,
  NetworkMutationType,
} from './NetworkTypes';

const SpectrumNetworkLayer: NetworkLayer = {
  sendQuery(networkQuery: NetworkQueryType): Promise<mixed> {
    return fetch(networkQuery.uri, {
      method: 'GET',
      ...networkQuery,
      headers: {
        Accepts: 'application/json',
        'Content-Type': 'application/json',
        ...networkQuery,
      },
    }).then(response => {
      if (response.status < 200 || response.status >= 300) {
        const error: Object = new Error('Received non-2xx response');
        error.response = response;

        throw error;
      }

      return response.json();
    });
  },
  sendMutation(networkQuery: NetworkMutationType): Promise<mixed> {
    return fetch(networkQuery.uri, {
      method: 'POST',
      ...networkQuery,
      headers: {
        Accepts: 'application/json',
        'Content-Type': 'application/json',
        ...networkQuery,
      },
    }).then(response => {
      if (response.status < 200 || response.status >= 300) {
        const error: Object = new Error('Received non-2xx response');
        error.response = response;

        throw error;
      }

      return response.json();
    });
  },
};

export default SpectrumNetworkLayer;
