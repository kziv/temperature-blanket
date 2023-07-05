'use strict';

const express = require('express');
const router = express.Router();
const location_controller = require('../controllers/location.js');
const weather_controller = require('../controllers/weather.js');

module.exports = function(app) {

  router.get('/location', location_controller.getLocation);

  router.get('/weather', weather_controller.getWeather);

  // All routes use this base path.
  app.use('/api', router);
};
