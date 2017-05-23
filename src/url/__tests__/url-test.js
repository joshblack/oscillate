/* @noflow */

import {format} from '../';

describe('url', () => {
  describe('#format', () => {
    it('should format a url given a path', () => {
      expect(format('')).toBe('/');
      expect(format('/')).toBe('/');
      expect(format('api')).toBe('/api');
      expect(format('/api')).toBe('/api');
    });

    it('should format a url given a path and params', () => {
      const params = {
        a: 1,
        b: [2, 3],
      };

      expect(format('/api/resources', params)).toBe('/api/resources?a=1&b=2,3');
    });
  });
});
