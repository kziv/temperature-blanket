const express = require('express');
const exphbs = require('express-handlebars'); // View templates
const path = require('path');
const cors = require('cors');

// ----- App config -----
const port = 3000;
// ----------------------

// Initialize express framework.
const app = express();

// Load routes.
require('./src/routes')(app);

// Use CORS and temporarily allow all origins for local testing.
app.use(cors());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// View engine
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// ----- Middleware -----
app.use(express.static(path.join(__dirname, 'public'))); // Static files.
// ----------------------

if (!module.parent) {
  const server = app.listen(port);
  // Set server timeout for 10 minutes.
  server.timeout = 60 * 10 * 1000;
}

module.exports = app;
