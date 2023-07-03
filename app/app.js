const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Load routes.
require('./src/routes')(app);

// Use CORS and temporarily allow all origins for local testing.
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

if (!module.parent) {
  const server = app.listen(port);
  // Set server timeout for 10 minutes.
  server.timeout = 60 * 10 * 1000;
}

module.exports = app;
