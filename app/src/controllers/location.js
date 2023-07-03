'use strict';

const axios = require('axios');

class Controller {

  getLocation = async (req, res) => {
    // Check for the required parameter.
    if (!req.query.address) {
      res.status(400).send('`address` is required');
    }

    const options = {
      baseURL: 'https://api.radar.io/v1/search/autocomplete',
      params: {
        query: req.query.address
      },
      headers: {
        // Call is publishable so use the appropriate key.
        Authorization: 'prj_live_pk_7d12b7cf2b16e8d57f846ed75dc1f04a9108a1c1'
      }
    };

    try {
      // Ping the radar.io API with the location data query.
      const response = await axios(options);

      // We assume the first result is the most relevant.
      if (response.data.hasOwnProperty('addresses') && Array.isArray(response.data.addresses) && response.data.addresses.length) {
        res.send(response.data.addresses[0]);
      }
    }
    catch (err) {
      console.log(err); // DEBUG
      // Just show there was an error.
      res.status(err.response.status).send(err.response.statusText);
    }
  }

}

module.exports = new Controller();
