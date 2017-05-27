'use strict';

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./lib/spectrum.production.js');
} else {
  module.exports = require('./lib/spectrum.development.js');
}
