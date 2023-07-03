'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/location.js');

module.exports = function(app) {

  router.get('/', controller.getLocation);

  // All routes use this base path.
  app.use('/location', router);
};
