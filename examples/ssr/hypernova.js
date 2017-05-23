'use strict';

const hypernova = require('hypernova/server');
const renderReact = require('hypernova-react').renderReact;

hypernova({
  devMode: true,

  getComponent(name) {
    if (name === 'App') {
      return renderReact(
        'App.js',
        require('./src/App').default
      );
    }
    return null;
  },

  port: 3001,
});
