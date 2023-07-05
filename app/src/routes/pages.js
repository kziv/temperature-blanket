'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/pages.js');

module.exports = function(app) {

  // Home page
  router.get('/', controller.home);

  // All routes use this base path.
  app.use('/', router);
};
