const express = require('express');
const app = express();
const port = 3000;

// Load routes.
require('./src/routes')(app);

if (!module.parent) {
  const server = app.listen(port);
  // Set server timeout for 10 minutes.
  server.timeout = 60 * 10 * 1000;
}

module.exports = app;
