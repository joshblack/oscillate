/* @noflow */

describe('NetworkQuery', () => {
  describe('#create', () => {
    let create;

    beforeEach(() => {
      jest.resetModuleRegistry();
      create = require('../NetworkQuery').create;
    });

    it('should be able to be created with a path', () => {
      expect(create('/api')).toEqual({
        id: 'q0',
        path: '/api',
        method: 'GET',
        uri: '/api',
      });
    });

    it('should be able to be created with a path and params', () => {
      expect(create('/api/resources', {first: 5})).toEqual({
        id: 'q0',
        path: '/api/resources',
        params: {first: 5},
        method: 'GET',
        query: 'first=5',
        uri: '/api/resources?first=5',
      });
    });

    it('should be able to be created with a path and headers', () => {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      expect(create('/api', undefined, headers)).toEqual({
        id: 'q0',
        path: '/api',
        method: 'GET',
        uri: '/api',
        headers,
      });
    });
  });

  describe('#hash', () => {
    let NetworkQuery;

    beforeEach(() => {
      jest.resetModuleRegistry();
      NetworkQuery = require('../NetworkQuery');
    });

    it('should hash a query with only a path available', () => {
      const query = NetworkQuery.create('/api');

      expect(NetworkQuery.hash(query)).toBe('GET /api');
    });

    it('should hash a query with path and query available', () => {
      const query = NetworkQuery.create('/api/resources', {
        first: 5,
      });

      expect(NetworkQuery.hash(query)).toBe('GET /api/resources?first=5');
    });

    it('should hash a query with path, query, and headers available', () => {
      const path = '/api/resources';
      const params = {first: 5};
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      const query = NetworkQuery.create(path, params, headers);

      expect(NetworkQuery.hash(query)).toBe(
        'GET /api/resources?first=5 ' +
          'accept:application/json,' +
          'content-type:application/json',
      );
    });
  });
});
