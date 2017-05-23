/* @noflow */

const Deferred = require.requireActual('fbjs/lib/Deferred');

const fetch = jest.fn(() => {
  const deferred = new Deferred();
  fetch.mocks.deferreds.push(deferred);
  return deferred.getPromise();
});

fetch.mock.deferreds = [];

module.exports = fetch;
