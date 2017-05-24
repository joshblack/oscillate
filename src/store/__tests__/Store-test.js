/* @noflow */

const genResponse = value =>
  Promise.resolve({
    status: 200,
    json: () => Promise.resolve(value),
  });

const genFailureResponse = value =>
  Promise.resolve({
    status: 500,
    json: () => Promise.resolve(value),
  });

describe('Store', () => {
  let fetch;
  let Store;
  let NetworkQuery;
  let NetworkMutation;
  let NetworkLayer;

  beforeEach(() => {
    jest.resetModuleRegistry();

    fetch = require('fbjs/lib/fetchWithRetries');
    Store = require('../Store').default;
    NetworkQuery = require('../../network/NetworkQuery');
    NetworkMutation = require('../../network/NetworkMutation');
    NetworkLayer = require('../../network/NetworyLayer').default;
  });

  describe('#read', () => {
    it('should return a promise', () => {
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const promise = store.read(query, key);

      expect(promise.then).toBeDefined();
      expect(promise.catch).toBeDefined();
    });

    it('should send a request and add it to the cache and resolve with the response', async () => {
      const value = {foo: 'bar'};
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const promise = store.read(query, key);

      fetch.mock.deferreds[0].resolve(genResponse(value));

      expect(await promise).toEqual(value);
      expect(store._cache.get(key)).toBeDefined();
    });

    it('should resolve from cache if an entry exists for the given key', async () => {
      const value = {foo: 'bar'};
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const promise1 = store.read(query, key);

      fetch.mock.deferreds[0].resolve(genResponse(value));
      await promise1;

      const promise2 = store.read(query, key, {forceFetch: false});
      expect(await promise2).toEqual(value);
    });

    it('should reject with an error if something goes wrong with the request', async () => {
      const error = {error: 'Message'};
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const promise = store.read(query, key);

      fetch.mock.deferreds[0].resolve(genFailureResponse(error));

      try {
        await promise;
        // eslint-disable-next-line no-shadow
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('#subscribe', () => {
    it('should return a disposable', () => {
      const subscriber = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
      };
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const disposable = store.subscribe(query, key, {}, subscriber);
      expect(disposable.dispose).toBeDefined();
    });

    it('should call onSuccess once when a successful response is received', done => {
      const subscriber = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
      };
      const value = {foo: 'bar'};
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      store.subscribe(query, key, {}, subscriber);

      fetch.mock.deferreds[0].resolve(genResponse(value));

      setTimeout(() => {
        try {
          expect(subscriber.onSuccess).toHaveBeenCalledTimes(1);
          done();
        } catch (error) {
          done.fail(error);
        }
      });
    });

    it('should resolve from cache and call onSuccess if a duplicate request is sent', done => {
      const subscriber = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
      };
      const value = {foo: 'bar'};
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      store.subscribe(query, key, {}, subscriber);

      fetch.mock.deferreds[0].resolve(genResponse(value));

      setTimeout(() => {
        try {
          expect(subscriber.onSuccess).toHaveBeenCalledTimes(1);
          store.subscribe(query, key, {forceFetch: false}, subscriber);
          expect(subscriber.onSuccess).toHaveBeenCalledTimes(2);

          done();
        } catch (error) {
          done.fail(error);
        }
      });
    });

    it('should call onFailure once when a bad response is received', done => {
      const subscriber = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
      };
      const error = {error: 'Error'};
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      store.subscribe(query, key, {}, subscriber);

      fetch.mock.deferreds[0].resolve(genFailureResponse(error));

      setTimeout(() => {
        try {
          expect(subscriber.onFailure).toHaveBeenCalled();
          done();
          // eslint-disable-next-line no-shadow
        } catch (error) {
          done.fail(error);
        }
      });
    });

    it('should call onSuccess when a cache entry is updated', done => {
      const subscriber = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
      };
      const value1 = {foo: 'bar1'};
      const value2 = {foo: 'bar2'};
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();

      store.injectNetworkLayer(NetworkLayer);
      store.subscribe(query, key, {}, subscriber);
      fetch.mock.deferreds[0].resolve(genResponse(value1));

      setTimeout(() => {
        try {
          store.subscribe(
            query,
            key,
            {forceFetch: true},
            {
              onSuccess: jest.fn(),
            },
          );
          fetch.mock.deferreds[1].resolve(genResponse(value2));

          setTimeout(() => {
            try {
              expect(subscriber.onSuccess).toHaveBeenCalledTimes(2);
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

    it('should not call onSuccess if the subscription is disposed beforehand', done => {
      const subscriber = {
        onSuccess: jest.fn(),
        onFailure: jest.fn(),
      };
      const value = {foo: 'bar1'};
      const query = NetworkQuery.create('/api/items');
      const key = NetworkQuery.hash(query);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const disposable = store.subscribe(query, key, {}, subscriber);
      disposable.dispose();

      fetch.mock.deferreds[0].resolve(genResponse(value));

      setTimeout(() => {
        try {
          expect(subscriber.onSuccess).not.toHaveBeenCalled();
          done();
        } catch (error) {
          done.fail(error);
        }
      });
    });
  });

  describe('#write', () => {
    it('should return a promise', () => {
      const mutation = NetworkMutation.create({
        path: '/api/resources',
        body: {
          foo: 'bar',
        },
      });
      const key = NetworkMutation.hash(mutation);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const promise = store.write(mutation, key, {});

      expect(promise.then).toBeDefined();
      expect(promise.catch).toBeDefined();
    });

    it('should send a mutation and resolve with the response', async () => {
      const mutation = NetworkMutation.create({
        path: '/api/resources',
        body: {
          foo: 'bar',
        },
      });
      const key = NetworkMutation.hash(mutation);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const promise = store.write(mutation, key, {});

      fetch.mock.deferreds[0].resolve(
        genResponse({
          foo: 'bar',
        }),
      );

      expect(await promise).toEqual({
        foo: 'bar',
      });
    });

    it('should reject with an error if something goes wrong', async () => {
      const mutation = NetworkMutation.create({
        path: '/api/resources',
        body: {
          foo: 'bar',
        },
      });
      const key = NetworkMutation.hash(mutation);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const promise = store.write(mutation, key, {});

      fetch.mock.deferreds[0].resolve(
        genFailureResponse({
          error: 'Error',
        }),
      );

      try {
        await promise;
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should resolve from cache if cacheConfig is not set to forceFetch', async () => {
      const value = {foo: 'bar'};
      const mutation = NetworkMutation.create({
        path: '/api/resources',
        body: {
          foo: 'bar',
        },
      });
      const key = NetworkMutation.hash(mutation);
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      const promise1 = store.write(mutation, key, {forceFetch: true});
      fetch.mock.deferreds[0].resolve(genResponse(value));
      await promise1;

      const promise2 = store.write(mutation, key, {forceFetch: false});
      expect(await promise2).toEqual(value);
    });
  });

  describe('#peak', () => {
    let store;
    let query1;
    let key1;
    let query2;
    let key2;
    let mutation1;
    let key3;
    const response1 = {foo: 'bar1'};
    const response2 = {foo: 'bar2'};
    const response3 = {foo: 'bar3'};

    // Pre-populate the store with a couple of queries
    beforeEach(async () => {
      store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      query1 = NetworkQuery.create('/api/1');
      key1 = NetworkQuery.hash(query1);
      query2 = NetworkQuery.create('/api/2');
      key2 = NetworkQuery.hash(query2);
      mutation1 = NetworkMutation.create({path: '/api/resources'});
      key3 = NetworkMutation.hash(mutation1);

      const promise1 = store.read(query1, key1, {});
      const promise2 = store.read(query2, key2, {});
      const promise3 = store.write(mutation1, key3, {});

      fetch.mock.deferreds[0].resolve(genResponse(response1));
      fetch.mock.deferreds[1].resolve(genResponse(response2));
      fetch.mock.deferreds[2].resolve(genResponse(response3));

      await promise1;
      await promise2;
      await promise3;
    });

    it('should synchronously resolve a request for a query', () => {
      expect(store.peak(key1)).toEqual(response1);
    });

    it('should synchronously resolve a request for a mutation', () => {
      expect(store.peak(key3)).toEqual(response3);
    });

    it('should throw if it cannot find an entry', () => {
      expect(() => store.peak('foo')).toThrow();
    });
  });

  describe('#dehydrate', () => {
    let store;
    let query1;
    let key1;
    let query2;
    let key2;
    let mutation1;
    let key3;
    const response1 = {foo: 'bar1'};
    const response2 = {foo: 'bar2'};
    const response3 = {foo: 'bar3'};

    // Pre-populate the store with a couple of queries
    beforeEach(async () => {
      store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      query1 = NetworkQuery.create('/api/1');
      key1 = NetworkQuery.hash(query1);
      query2 = NetworkQuery.create('/api/2');
      key2 = NetworkQuery.hash(query2);
      mutation1 = NetworkMutation.create({path: '/api/resources'});
      key3 = NetworkMutation.hash(mutation1);

      const promise1 = store.read(query1, key1, {});
      const promise2 = store.read(query2, key2, {});
      const promise3 = store.write(mutation1, key3, {});

      fetch.mock.deferreds[0].resolve(genResponse(response1));
      fetch.mock.deferreds[1].resolve(genResponse(response2));
      fetch.mock.deferreds[2].resolve(genResponse(response3));

      await promise1;
      await promise2;
      await promise3;
    });

    it('should synchronously serialize the given cache store to a string', () => {
      expect(store.dehydrate()).toMatchSnapshot();
    });
  });

  describe('#rehydrate', () => {
    const size = 100;
    const ttl = 100000;
    const numberOfEntries = 3;
    // eslint-disable-next-line max-len
    const source =
      '{"size":100,"ttl":100000,"cache":{"GET /api/1":{"foo":"bar1"},"GET /api/2":{"foo":"bar2"},"POST /api/resources":{"foo":"bar3"}}}';

    it('should rebuild the Store with a given string', () => {
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);
      store.rehydrate(source);

      const cache = store.getCache();
      expect(cache.getSize()).toBe(size);
      expect(cache.getTTL()).toBe(ttl);
      expect(cache.getEntries().size).toBe(numberOfEntries);
    });

    it('should throw if it cannot rehydrate from the given source', () => {
      const store = new Store();
      store.injectNetworkLayer(NetworkLayer);

      expect(() => {
        store.rehydrate('foo');
      }).toThrow();
    });
  });
});
