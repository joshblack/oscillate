/* @noflow */

import {format} from '../params';

describe('params', () => {
  describe('#format', () => {
    it('should format primitive types correctly', () => {
      expect(format({a: 1})).toBe('a=1');
      expect(format({a: 'string'})).toBe('a=string');
      expect(format({a: true})).toBe('a=true');
      expect(format({a: null})).toBe('a=null');
      expect(format({a: undefined})).toBe('a=undefined');
    });

    it('should format a basic object to a string', () => {
      const input1 = {
        b: 2,
        a: 1,
      };

      expect(format(input1)).toBe('a=1&b=2');

      const input2 = {
        a: 1,
        b: 2,
      };

      expect(format(input2)).toBe('a=1&b=2');
    });

    it('should format a complex object to a string', () => {
      const input = {
        booleans: [true, false, true],
        nulls: [null, null, null],
        numbers: [1, 2, 3],
        strings: ['a', 'b', 'c'],
        undefineds: [undefined, undefined, undefined],
      };
      const expected = [
        'booleans=true,false,true',
        'nulls=null,null,null',
        'numbers=1,2,3',
        'strings=a,b,c',
        'undefineds=undefined,undefined,undefined',
      ];

      expect(format(input)).toBe(expected.join('&'));
    });

    it('should throw if given an unexpected object value', () => {
      const input = {
        nestedArray: [[1]],
      };

      expect(() => {
        format(input);
      }).toThrow();
    });
  });
});
