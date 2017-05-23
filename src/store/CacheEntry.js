/* @flow */

import type {Subscriber} from './StoreTypes';
import type {Disposable} from '../environment/SpectrumEnvironmentTypes';

export default class CacheEntry {
  _value: mixed;
  _cacheTime: number;
  _subscribers: Array<Subscriber>;

  constructor(value: mixed) {
    this._value = value;
    this._cacheTime = Date.now();
    this._subscribers = [];
  }

  getValue() {
    return this._value;
  }

  setValue(value: mixed) {
    this._value = value;
    this._subscribers.forEach(({onSuccess}) => {
      onSuccess && onSuccess(value);
    });
  }

  getCacheTime() {
    return this._cacheTime;
  }

  addSubscriber(subscriber: Subscriber): Disposable {
    const length = this._subscribers.length;

    this._subscribers.push(subscriber);

    return {
      dispose: () => {
        this._subscribers.splice(length, 1);
      },
    };
  }
}
