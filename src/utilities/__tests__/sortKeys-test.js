/* @noflow */

import sortKeys from '../sortKeys';

describe('sortKeys', () => {
  it('should sort the keys of the given object', () => {
    const input1 = {
      c: 3,
      b: 2,
      a: 1,
    };

    expect(sortKeys(input1)).toEqual(['a', 'b', 'c']);

    const input2 = {
      ab: 2,
      aa: 1,
    };

    expect(sortKeys(input2)).toEqual(['aa', 'ab']);
  });
});
