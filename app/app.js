require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars'); // View templates
const path = require('path');

// Initialize express framework.
const app = express();

// Load routes.
require('./src/routes')(app);

// View engine
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// ----- Local vars -----
// If this gets unwieldy, move to a separate file.
app.locals.siteTitle = 'Historical Temperature Blanket Generator';
app.locals.currentYear = new Date().getFullYear();
// ----------------------

// ----- Middleware -----
app.use(express.static(path.join(__dirname, 'public'))); // Static files.
// ----------------------

// Spool up the app.
if (!module.parent) {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, () => console.log(`Server is running on port ${port}`));
  // Set server timeout for 10 minutes.
  server.timeout = 60 * 10 * 1000;
}

module.exports = app;
