'use strict';

const path = require('path');
const chalk = require('chalk');
const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');
const uglify = require('rollup-plugin-uglify');
const sizes = require('./plugins/sizes-plugin');
const stats = require('./stats');

const external = [
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

const oscillateEntry = path.resolve(__dirname, '../../src/index.js');
const oscillateReactEntry = path.resolve(__dirname, '../../src/components/index.js');
const bundles = [
  {
    packageName: 'oscillate',
    filename: 'oscillate.development.js',
    entry: oscillateEntry,
    external,
    plugins: [
      babel(babelConfig),
    ],
    format: 'cjs',
  },
  {
    packageName: 'oscillate',
    filename: 'oscillate.production.js',
    entry: oscillateEntry,
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
  {
    packageName: 'oscillate-react',
    filename: 'oscillate-react.development.js',
    entry: oscillateReactEntry,
    external: [
      ...external,
      'react',
      'prop-types',
    ],
    plugins: [
      babel(babelConfig),
    ],
    format: 'cjs',
  },
  {
    packageName: 'oscillate-react',
    filename: 'oscillate-react.production.js',
    entry: oscillateReactEntry,
    external: [
      ...external,
      'react',
      'prop-types',
    ],
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
  const {packageName, filename, entry, external, plugins, format} = bundle;
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
      // dest: path.resolve(__dirname, `../../lib/${filename}`),
      dest: path.resolve(
        __dirname,
        `../../packages/${packageName}/lib/${filename}`
      )
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
