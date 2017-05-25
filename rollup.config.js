'use strict';

const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');

export default {
  entry: 'src/index.js',
  format: 'cjs',
  dest: 'lib/index.js',
  external: [
    'react',
    'prop-types',
    'fbjs/lib/areEqual',
    'fbjs/lib/invariant',
    'fbjs/lib/fetchWithRetries',
  ],
  plugins: [
    babel({
      babelrc: false,
      presets: [['es2015', {modules: false}], 'stage-2', 'react', 'flow'],
      plugins: ['external-helpers'],
      externalHelpers: true,
    }),
  ],
};
