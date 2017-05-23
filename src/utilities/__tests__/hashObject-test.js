/* @noflow */

import hashObject from '../hashObject';

describe('hashObject', () => {
  it('should hash a primitive object to a string', () => {
    const input1 = {
      b: 'two',
      a: 'one',
    };
    const input2 = {
      a: 'one',
      b: 'two',
    };

    expect([hashObject(input1), hashObject(input2)]).toEqual([
      'a:one,b:two',
      'a:one,b:two',
    ]);
  });
});
