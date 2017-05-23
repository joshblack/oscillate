'use strict';

const express = require('express');
const Renderer = require('hypernova-client');
const devModePlugin = require('hypernova-client/plugins/devModePlugin');

const server = express();
const renderer = new Renderer({
  url: 'http://localhost:3001/batch',
  plugins: [
    devModePlugin,
  ],
});

server.get('/api/items', (req, res) => {
  res.json([
    {name: 'Item #1'},
    {name: 'Item #2'},
    {name: 'Item #3'},
  ]);
});

server.get('/', (req, res) => {
  const jobs = {
    App: {
      name: req.query.name || 'Stranger',
    },
  };

  renderer.render(jobs)
    .then((html) => {
      res.send(html);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send('500 Internal Server Error');
    });
});

server.listen(3000, (error) => {
  if (error) {
    console.log(error);
    return;
  }

  console.log(`Listening at http://localhost:3000`);
});
