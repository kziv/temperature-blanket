'use strict';

const axios = require('axios');

class Controller {

  getLocation = async (req, res) => {
    // Check for the required parameter.
    if (!req.query.address) {
      return res.status(400).send('`address` is required');
    }

    const options = {
      baseURL: 'https://api.radar.io/v1/search/autocomplete',
      params: {
        query: req.query.address
      },
      headers: {
        // Call is publishable so use the appropriate key.
        Authorization: process.env.RADAR_API_KEY
      }
    };

    try {
      // Ping the radar.io API with the location data query.
      const response = await axios(options);

      // We assume the first result is the most relevant.
      if (response.data.hasOwnProperty('addresses') && Array.isArray(response.data.addresses) && response.data.addresses.length) {
        return res.send(response.data.addresses[0]);
      }
    }
    catch (err) {
      // Just show there was an error.
      return res.status(err.response.status).send(err.response.statusText);
    }

    // No results but ok query response.
    return res.status(200);
  }

}

module.exports = new Controller();
