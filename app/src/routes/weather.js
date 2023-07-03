'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/weather.js');

module.exports = function(app) {

  router.get('/', controller.getWeather);

  // All routes use this base path.
  app.use('/weather', router);
};
