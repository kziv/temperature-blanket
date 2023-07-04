'use strict';

const axios = require('axios');

class Controller {

  getWeather = async (req, res) => {
    // Check for the required parameters.
    if (!req.query.latitude || !req.query.longitude) {
      res.status(400).send('`latitude` and `longitude` are required');
    }

    // Calculate dates for default parameters.
    let today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    today = new Date(); // Reset this for further math.
    const last_year = new Date(today.setFullYear(today.getFullYear() - 1));

    //https://archive-api.open-meteo.com/v1/archive?latitude=35.0456&longitude=-85.3097&start_date=2019-11-14&end_date=2020-11-13&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FNew_York
    const options = {
      baseURL: 'https://archive-api.open-meteo.com/v1/archive',
      params: {
        latitude: req.query.latitude,
        longitude: req.query.longitude,
        temperature_unit: 'fahrenheit', // Can override later.
        start_date: req.query.start_date ?? last_year.toISOString().split('T')[0], // YYYY-MM-DD
        end_date: req.query.end_date ?? yesterday.toISOString().split('T')[0] // YYYY-MM-DD
      }
    };

    // Add temperature options.
    // @todo get these from the query.
    options.params.daily = req.query.stats ?? 'temperature_2m_mean';
    options.params.timezone = 'America/New_York';

    try {
      // Ping the radar.io API with the location data query.
      const response = await axios(options);
      console.log(response); // DEBUG
      res.send(response.data);
    }
    catch (err) {
      console.log(err); // DEBUG
      // Just show there was an error.
      res.status(err.response.status).send(err.response.statusText);
    }

  }

}

module.exports = new Controller();
