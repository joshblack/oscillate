/* @noflow */

const TTL = 1000;
const NOW = 1493592060835;

describe('Environment', () => {
  let fetch;
  let Store;
  let Environment;
  let NetworkQuery;
  let env;

  beforeEach(() => {
    jest.resetModuleRegistry();

    // Mock for our TTL in our ResponseCache
    Date.now = jest.fn(() => NOW);

    fetch = require('fbjs/lib/fetchWithRetries');
    Store = require('../../store/Store').default;
    Environment = require('../SpectrumEnvironment').default;
    NetworkQuery = require('../../network/NetworkQuery');

    const store = new Store({
      size: 10,
      ttl: 1000,
    });

    env = new Environment({store});
  });

  describe('#sendQuery', () => {
    it('should be able to send a network query', () => {
      expect(env.sendQuery).toBeDefined();
    });

    it('should return a promise when sending a network query and no subscription option is specified', () => {
      const config = {
        path: '/api/resources',
      };

      const request = env.sendQuery(config);

      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();
    });

    it('should be able to send a network query and subscribe to a response', done => {
      const response = [{foo: 'bar'}, {bar: 'baz'}];
      const subscription = {
        onSuccess: result => {
          expect(result).toEqual(response);
          done();
        },
        onFailure: error => {
          expect(error).not.toBeDefined();
          done();
        },
      };

      env.sendQuery({
        path: '/api/items',
        params: {
          first: 5,
        },
        ...subscription,
      });

      fetch.mock.deferreds[0].resolve({
        json: () => Promise.resolve(response),
      });
    });

    // TODO: There has to be a better way of testing this, since really we
    // aren't actually waiting for everything to settle down in terms of the
    // Promise-chain.
    it('should be able to dispose of a subscriber', () => {
      const response = [{foo: 'bar'}, {bar: 'baz'}];
      const subscription = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
      };

      const {dispose} = env.sendQuery({
        path: '/api/items',
        params: {
          first: 5,
        },
        ...subscription,
      });

      dispose();

      fetch.mock.deferreds[0].resolve({
        json: () => Promise.resolve(response),
      });

      expect(subscription.onSuccess).not.toHaveBeenCalled();
      expect(subscription.onFailure).not.toHaveBeenCalled();
    });

    it('should update subscribers when a cache entry is updated', done => {
      const subscriber = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
      };
      const response1 = [{foo: 'bar'}, {bar: 'baz'}];
      const response2 = [{foo: 'bar'}, {bar: 'baz'}, {baz: 'foo'}];

      env.sendQuery({
        path: '/api/items',
        params: {
          first: 5,
        },
        ...subscriber,
      });

      fetch.mock.deferreds[0].resolve({
        json: () => Promise.resolve(response1),
      });

      // We have this crazy setTimeout pyramid in order to make sure the
      // Promise queue has been flushed and our subscriber methods have been
      // invoked. If there is a better way to do this, please help out!
      setTimeout(() => {
        try {
          expect(subscriber.onSuccess).toHaveBeenCalledTimes(1);

          env.sendQuery({
            path: '/api/items',
            params: {
              first: 5,
            },
            cacheConfig: {
              forceFetch: true,
            },
            ...subscriber,
          });

          fetch.mock.deferreds[1].resolve({
            json: () => Promise.resolve(response2),
          });

          setTimeout(() => {
            try {
              expect(subscriber.onSuccess).toHaveBeenCalledTimes(3);
              done();
            } catch (error) {
              done.fail(error);
            }
          });
        } catch (error) {
          done.fail(error);
        }
      });
    });

    it('should be able to send a network query and get a response', async () => {
      const config = {
        path: '/api/resources',
      };
      const request = env.sendQuery(config);
      const response = {
        foo: 'bar',
      };

      fetch.mock.deferreds[0].resolve({
        json: () => Promise.resolve(response),
      });

      expect(await request).toEqual(response);
    });

    it('should respond with an error if given a non-200 response', async () => {
      const config = {
        path: '/api/resources',
      };

      const request = env.sendQuery(config);

      fetch.mock.deferreds[0].resolve({status: 404});

      try {
        await request;
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    describe('cacheConfig', () => {
      it('should read from the store if a query is repeated', async () => {
        const config = {
          path: '/api/resources',
        };
        const response = {
          foo: 'bar',
        };

        const request1 = env.sendQuery(config);

        fetch.mock.deferreds[0].resolve({
          json: () => Promise.resolve(response),
        });

        expect(await request1).toEqual(response);
        expect(fetch.mock.deferreds.length).toBe(1);

        const request2 = env.sendQuery(config);

        expect(fetch.mock.deferreds.length).toBe(1);
        expect(await request2).toEqual(response);
      });

      it('should not read from the store for a repeated query if force-fetched', async () => {
        const config = {
          path: '/api/resources',
        };
        const response1 = {
          foo: 'bar',
        };

        const request1 = env.sendQuery(config);

        fetch.mock.deferreds[0].resolve({
          json: () => Promise.resolve(response1),
        });

        expect(await request1).toEqual(response1);
        expect(fetch.mock.deferreds.length).toBe(1);

        const response2 = {
          bar: 'baz',
        };
        const request2 = env.sendQuery({
          ...config,
          cacheConfig: {
            forceFetch: true,
          },
        });

        expect(fetch.mock.deferreds.length).toBe(2);
        fetch.mock.deferreds[1].resolve({
          json: () => Promise.resolve(response2),
        });

        expect(await request2).toEqual(response2);
      });

      it('should send a fresh query if what exists in the store is stale', async () => {
        const config = {
          path: '/api/resources',
        };
        const response1 = {
          foo: 'bar',
        };

        const request1 = env.sendQuery(config);

        fetch.mock.deferreds[0].resolve({
          json: () => Promise.resolve(response1),
        });

        expect(await request1).toEqual(response1);
        expect(fetch.mock.deferreds.length).toBe(1);

        // Invalidate the cached entry
        Date.now = jest.fn(() => NOW + TTL + 1);
        const response2 = {
          bar: 'baz',
        };
        const request2 = env.sendQuery(config);

        expect(fetch.mock.deferreds.length).toBe(2);
        fetch.mock.deferreds[1].resolve({
          json: () => Promise.resolve(response2),
        });

        expect(await request2).toEqual(response2);
      });
    });
  });

  describe('#sendMutation', () => {
    it('should have a method to send a mutation', () => {
      expect(env.sendMutation).toBeDefined();
    });

    it('should return a promise when sending a mutation', () => {
      const config = {
        path: '/api/users',
        method: 'POST',
        body: {
          name: 'Jane Doe',
        },
      };
      const request = env.sendMutation(config);

      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();
    });

    it('should be able to send a mutation', async () => {
      const config = {
        path: '/api/users',
        method: 'POST',
        body: {
          name: 'Jane Doe',
        },
      };
      const response = {
        user: 'Jane Doe',
        insertedAt: 'foo',
        updatedAt: 'foo',
      };
      const request = env.sendMutation(config);

      fetch.mock.deferreds[0].resolve({
        json: () => Promise.resolve(response),
      });

      expect(await request).toEqual(response);
    });

    it('should support multiple methods when sending mutations', async () => {
      /**
      * Idea here is to emulate the following workflow to test the variety of
      * methods that we should support for mutations:
      *
      * 1) Create a user
      * 2) Update a user (with PUT)
      * 3) Update a user (with PATCH)
      * 4) Delete a user
      */
      const requests = [
        [
          {
            path: '/api/users',
            method: 'POST',
            body: {
              user: 'Jane Doe',
            },
          },
          {
            user: 'Jane Doe',
            insertedAt: 0,
            updatedAt: 0,
          },
        ],
        [
          {
            path: '/api/users/1',
            method: 'PUT',
            body: {
              user: 'John Doe',
            },
          },
          {
            user: 'John Doe',
            insertedAt: 0,
            updatedAt: 1,
          },
        ],
        [
          {
            path: '/api/users/1',
            method: 'PATCH',
            body: {
              user: 'Jane Doe',
            },
          },
          {
            user: 'Jane Doe',
            insertedAt: 0,
            updatedAt: 2,
          },
        ],
        [
          {
            path: '/api/users/1',
            method: 'DELETE',
          },
          {
            user: 'Jane Doe',
          },
        ],
      ];

      const promises = requests.map(async (setup, i) => {
        const [request, response] = setup;
        const mutation = env.sendMutation(request);

        fetch.mock.deferreds[i].resolve({
          json: () => Promise.resolve(response),
        });

        expect(await mutation).toEqual(response);
      });

      await Promise.all(promises);
    });

    it('should be able to send a form', async () => {
      const config = {
        path: '/api/upload',
        method: 'POST',
        body: new FormData(),
      };
      const response = {
        message: 'Uploaded successfully',
      };
      const request = env.sendMutation(config);

      fetch.mock.deferreds[0].resolve({
        json: () => Promise.resolve(response),
      });

      expect(await request).toEqual(response);
    });

    describe('cacheConfig', () => {
      it('should let a user cache a mutation response', async () => {
        const config = {
          path: '/api/search',
          params: {
            q: 'foo',
          },
          cacheConfig: {
            forceFetch: false,
          },
        };
        const response = [{foo: 'bar'}, {bar: 'baz'}];
        const request1 = env.sendMutation(config);

        expect(fetch.mock.deferreds.length).toBe(1);

        fetch.mock.deferreds[0].resolve({
          json: () => Promise.resolve(response),
        });

        expect(await request1).toEqual(response);

        env.sendMutation(config);

        expect(fetch.mock.deferreds.length).toBe(1);
      });
    });
  });

  describe('#prefetch', () => {
    it('should add queries to the pendingQueries array', () => {
      const {pendingQueries} = require('../SpectrumEnvironment');
      const query = NetworkQuery.create('/api/foo');

      expect(pendingQueries.length).toBe(0);

      Environment.prefetch(query);

      expect(pendingQueries.length).toBe(1);
      expect(pendingQueries[0]).toEqual(query);
    });
  });

  describe('#preload', () => {
    it('should return a promise', () => {
      const promise = env.preload();
      expect(promise.then).toBeDefined();
      expect(promise.catch).toBeDefined();
    });

    it('should resolve if all the queries are satisfied', async () => {
      const q0 = NetworkQuery.create('api/q0');
      const q1 = NetworkQuery.create('api/q1');

      Environment.prefetch(q0);
      Environment.prefetch(q1);

      const promise = env.preload();

      fetch.mock.deferreds.forEach(deferred => {
        deferred.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              foo: 'bar',
            }),
        });
      });

      await promise;

      // TODO: clean up chain here so we don't rely on internals
      expect(env._store._cache._cache.size).toBe(2);
    });

    it('should throw if not all the queries could be satisfied', async () => {
      const q0 = NetworkQuery.create('api/q0');
      const q1 = NetworkQuery.create('api/q1');

      Environment.prefetch(q0);
      Environment.prefetch(q1);

      const promise = env.preload();

      fetch.mock.deferreds[0].resolve({
        status: 200,
        json: () =>
          Promise.resolve({
            foo: 'bar',
          }),
      });
      fetch.mock.deferreds[1].resolve({
        status: 500,
        json: () =>
          Promise.resolve({
            error: 'Error',
          }),
      });

      try {
        await promise;
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should flush the pendingQueries queue', async () => {
      const q0 = NetworkQuery.create('api/q0');
      const q1 = NetworkQuery.create('api/q1');
      let {pendingQueries} = require('../SpectrumEnvironment');

      Environment.prefetch(q0);
      Environment.prefetch(q1);

      const promise = env.preload();

      fetch.mock.deferreds.forEach(deferred => {
        deferred.resolve({
          status: 200,
          json: () =>
            Promise.resolve({
              foo: 'bar',
            }),
        });
      });

      await promise;

      pendingQueries = require('../SpectrumEnvironment').pendingQueries;
      expect(pendingQueries.length).toBe(0);
    });
  });
});
