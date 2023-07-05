'use strict';

const axios = require('axios');

class Controller {

  getWeather = async (req, res) => {
    // Check for the required parameters.
    if (!req.query.latitude || !req.query.longitude) {
      return res.status(400).send('`latitude` and `longitude` are required');
    }

    // Calculate dates for default parameters.
    let today = new Date();
    const yesterday = new Date(today.setDate(today.getDate() - 1));
    today = new Date(); // Reset this for further math.
    const last_year = new Date(today.setFullYear(today.getFullYear() - 1));

    const options = {
      baseURL: 'https://archive-api.open-meteo.com/v1/archive',
      params: {
        latitude: req.query.latitude,
        longitude: req.query.longitude,
        temperature_unit: 'fahrenheit', // Can override later.
        start_date: req.query.start_date ?? last_year.toISOString().split('T')[0], // YYYY-MM-DD
        end_date: req.query.end_date ?? yesterday.toISOString().split('T')[0], // YYYY-MM-DD
        timezone: 'America/New_York', // @todo make this dynamic
      }
    };

    // Add temperature options.
    options.params.daily = req.query.stats ?? 'temperature_2m_mean';

    try {
      // Ping the radar.io API with the location data query.
      const response = await axios(options);
      return res.send(response.data);
    }
    catch (err) {
      // Just show there was an error.
      return res.status(err.response.status).send(err.response.statusText);
    }

    // Unless you send weird coordinates with no weather, this should never hit.
    // Still, it's a no results but ok query response.
    return res.status(200);
  }

}

module.exports = new Controller();
