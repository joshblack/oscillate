/* @noflow */

'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./lib/oscillate.production.js');
} else {
  module.exports = require('./lib/oscillate.development.js');
}
