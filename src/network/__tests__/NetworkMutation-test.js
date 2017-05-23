/* @noflow */

describe('NetworkMutation', () => {
  describe('#create', () => {
    let create;

    beforeEach(() => {
      jest.resetModuleRegistry();
      create = require('../NetworkMutation').create;
    });

    it('should be able to be created with a path', () => {
      const config = {
        path: '/api/users',
      };
      expect(create(config)).toEqual({
        id: 'm0',
        path: '/api/users',
        method: 'POST',
        uri: '/api/users',
      });
    });

    it('should encode an object body value to JSON', () => {
      const config = {
        path: '/api/users',
        body: {user: 'Jane Doe'},
      };
      expect(create(config)).toEqual({
        id: 'm0',
        path: '/api/users',
        method: 'POST',
        uri: '/api/users',
        body: '{"user":"Jane Doe"}',
      });
    });

    it('should not encode a FormData body value', () => {
      const formData = new FormData();
      const config = {
        path: '/api/upload',
        method: 'POST',
        body: formData,
      };
      expect(create(config)).toEqual({
        id: 'm0',
        path: '/api/upload',
        method: 'POST',
        uri: '/api/upload',
        body: formData,
      });
    });

    it('should be able to be created with a path and params', () => {
      const config = {
        path: '/api/resources',
        params: {first: 5},
      };
      expect(create(config)).toEqual({
        id: 'm0',
        path: '/api/resources',
        params: {first: 5},
        method: 'POST',
        query: 'first=5',
        uri: '/api/resources?first=5',
      });
    });

    it('should be able to be created with a path and headers', () => {
      const config = {
        path: '/api',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      };

      expect(create(config)).toEqual({
        id: 'm0',
        path: '/api',
        method: 'POST',
        uri: '/api',
        headers: config.headers,
      });
    });
  });

  describe('#hash', () => {
    let NetworkMutation;

    beforeEach(() => {
      jest.resetModuleRegistry();
      NetworkMutation = require('../NetworkMutation');
    });

    it('should hash a query with only a path available', () => {
      const query = NetworkMutation.create({path: '/api'});

      expect(NetworkMutation.hash(query)).toBe('POST /api');
    });

    it('should hash a query with path and query available', () => {
      const query = NetworkMutation.create({
        path: '/api/resources',
        params: {
          first: 5,
        },
      });

      expect(NetworkMutation.hash(query)).toBe('POST /api/resources?first=5');
    });

    it('should hash a query with path, query, and headers available', () => {
      const config = {
        path: '/api/resources',
        params: {first: 5},
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      };
      const query = NetworkMutation.create(config);

      expect(NetworkMutation.hash(query)).toBe(
        'POST /api/resources?first=5 ' +
          'accept:application/json,' +
          'content-type:application/json',
      );
    });

    it('should hash a query with path, query, headers, and body available', () => {
      const config = {
        path: '/api/resources',
        params: {first: 5},
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: {
          foo: 'bar',
        },
      };
      const query = NetworkMutation.create(config);
      const segments = [
        'POST',
        '/api/resources?first=5',
        'accept:application/json,content-type:application/json',
        '{"foo":"bar"}',
      ];

      expect(NetworkMutation.hash(query)).toBe(segments.join(' '));
    });
  });
});
