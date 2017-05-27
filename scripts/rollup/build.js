'use strict';

const path = require('path');
const chalk = require('chalk');
const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const sizes = require('./plugins/sizes-plugin');
const stats = require('./stats');

const entry = path.resolve(__dirname, '../../src/index.js');
const external = [
  'react',
  'prop-types',
  'fbjs/lib/areEqual',
  'fbjs/lib/invariant',
  'fbjs/lib/fetchWithRetries',
];
const babelConfig = {
  babelrc: false,
  presets: [['es2015', {modules: false}], 'stage-2', 'react', 'flow'],
  plugins: ['external-helpers'],
  externalHelpers: true,
};

const bundles = [
  {
    filename: 'spectrum.development.js',
    entry,
    external,
    plugins: [
      babel(babelConfig),
    ],
    format: 'cjs',
  },
  {
    filename: 'spectrum.production.js',
    entry,
    external,
    plugins: [
      babel(babelConfig),
      uglify({
        warnings: false,
        compress: {
          dead_code: true,
          unused: true,
          drop_debugger: true,
          evaluate: true,
          booleans: true,
        },
      }),
    ],
    format: 'cjs',
  },
];

const steps = bundles.map((bundle) => {
  const {filename, entry, external, plugins, format} = bundle;
  return Promise.resolve()
    .then(() => rollup({
      entry,
      external,
      plugins: [
        ...plugins,
        sizes({
          getSize: (size, gzip) => {
            stats.currentBuildResults.bundleSizes[filename] = {
              size,
              gzip,
            };
          },
        }),
      ],
    }))
    .then((result) => result.write({
      format,
      dest: path.resolve(__dirname, `../../lib/${filename}`),
    }))
    .then(() => {
      console.log(chalk.green(`✅  ${filename}`));
    });
});

Promise.all(steps)
  .then(() => {
    stats.saveResults();
    console.log(stats.printResults());
  })
  .catch((error) => console.log(error));
