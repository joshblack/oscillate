/* @noflow */

Date.now = jest.fn(() => 1495549103720);

describe('CacheEntry', () => {
  let CacheEntry;

  beforeEach(() => {
    CacheEntry = require('../CacheEntry').default;
  });

  it('should initialize with a given value, cacheTime, and empty subscriber list', () => {
    const value = 1;
    const entry = new CacheEntry(value);

    expect(entry._value).toBe(value);
    expect(entry._cacheTime).toBe(Date.now());
    expect(entry._subscribers.length).toBe(0);
  });

  it('should be able to add a subscriber to the list of subscribers', () => {
    const value = 1;
    const entry = new CacheEntry(value);
    const subscriber = jest.fn();

    entry.addSubscriber(subscriber);
    expect(entry._subscribers.length).toBe(1);
  });

  it('should notify all subscribers when the value changes', () => {
    const value = 1;
    const nextValue = 2;
    const entry = new CacheEntry(value);
    const onSuccess = jest.fn();

    entry.addSubscriber({onSuccess});
    entry.setValue(nextValue);

    expect(onSuccess).toHaveBeenCalledWith(nextValue);
  });

  it('should remove a subscriber when it is disposed', () => {
    const initialValue = 1;
    const nextValue = 2;
    const entry = new CacheEntry(initialValue);
    const onSuccess1 = jest.fn();
    const onSuccess2 = jest.fn();

    const {dispose} = entry.addSubscriber({onSuccess: onSuccess1});
    entry.addSubscriber({onSuccess: onSuccess2});
    entry.setValue(nextValue);

    expect(onSuccess1).toHaveBeenCalledWith(nextValue);
    expect(onSuccess2).toHaveBeenCalledWith(nextValue);

    dispose();

    entry.setValue(initialValue);
    expect(onSuccess1).toHaveBeenCalledTimes(1);
    expect(onSuccess2).toHaveBeenCalledTimes(2);
  });
});
