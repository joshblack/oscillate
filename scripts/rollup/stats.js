'use strict';

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Table = require('cli-table');
const filesize = require('filesize');
const prevBuildResults = require('./results.json');

const currentBuildResults = {
  bundleSizes: Object.assign({}, prevBuildResults.bundleSizes),
};

const saveResults = () => {
  fs.writeFileSync(
    path.resolve(__dirname, './results.json'),
    JSON.stringify(currentBuildResults, null, 2)
  );
};

const percentChange = (prev, current) => {
  const change = Math.floor((current - prev) / prev * 100);
  if (change > 0) {
    return chalk.red.bold(`+${change} %`);
  } else if (change <= 0) {
    return chalk.green.bold(change + ' %');
  }
};

const printResults = () => {
  const table = new Table({
    head: [
      chalk.gray.yellow('Bundle'),
      chalk.gray.yellow('Prev Size'),
      chalk.gray.yellow('Current Size'),
      chalk.gray.yellow('Diff'),
      chalk.gray.yellow('Prev Gzip'),
      chalk.gray.yellow('Current Gzip'),
      chalk.gray.yellow('Diff'),
    ],
  });

  Object.keys(currentBuildResults.bundleSizes).forEach(key => {
    const result = currentBuildResults.bundleSizes[key];
    const prev = prevBuildResults.bundleSizes[key];
    if (result === prev) {
      // We didn't rebuild this bundle.
      return;
    }

    const size = result.size;
    const gzip = result.gzip;

    const prevSize = prev ? prev.size : 0;
    const prevGzip = prev ? prev.gzip : 0;

    table.push([
      chalk.white.bold(key),
      chalk.gray.bold(filesize(prevSize)),
      chalk.white.bold(filesize(size)),
      percentChange(prevSize, size),
      chalk.gray.bold(filesize(prevGzip)),
      chalk.white.bold(filesize(gzip)),
      percentChange(prevGzip, gzip),
    ]);
  });

  return table.toString();
};

module.exports = {
  saveResults,
  printResults,
  currentBuildResults,
};
