/* @noflow */

const Deferred = require('fbjs/lib/Deferred');

function fetchWithRetries(...args) {
  const deferred = new Deferred();
  fetchWithRetries.mock.calls.push(args);
  fetchWithRetries.mock.deferreds.push(deferred);
  return deferred.getPromise();
}

fetchWithRetries.mock = {
  calls: [],
  deferreds: [],
};

module.exports = fetchWithRetries;
