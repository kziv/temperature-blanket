/**
 *
 */
;(function () {
  'use strict';

  // Attach event handler to form submit.
  document.getElementById('form-specs').addEventListener('submit', function (event) {
    event.preventDefault();

    // Get the zip code for looking up weather data.
    const zip = document.getElementById('field-zip').value;
    getLatLongByZip(zip)
      .then((coordBounds) => {
        return getWeather(coordBounds);
      });

    /*
      .then((coordBounds) => {
        return getStation(coordBounds);
      })
      .then((stationId) => {
        console.log(stationId);
        const startDate = document.getElementById('field-start').value;
        const endDate = document.getElementById('field-end').value;
        return getTemps(stationId, startDate, endDate);
      })
    getTemps(zip)
      .then((data) => {
        return data;
      });
    */
  });

  /**
   *
   */
  function getLatLongByZip(zip) {
    try {
      return axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          key: 'AIzaSyDxJ_VCxK1pBWmFBwZ3XxZy7sPw7eWVGsY',
          address: zip
        }
      })
        .then((res) => {
          // Parse the data for lat/long and make a bounds box.
          if (res.data.results.length) {
            const point = res.data.results[0].geometry.bounds;
            //return `${point.southwest.lat},${point.southwest.lng},${point.northeast.lat},${point.northeast.lng}`;
            return `${point.southwest.lat},${point.southwest.lng}`;
          }
          else {
            console.log(res);
            return null;
          }
        })
        .catch (err => console.error(err));
    }
    catch (err) {
      console.log(err);
    }

    return true;
  }

  function getWeather(latlong) {
    https://archive-api.open-meteo.com/v1/archive?latitude=35.0456&longitude=-85.3097&start_date=2019-11-14&end_date=2020-11-13&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=America%2FNew_York
    try {
      return axios.get(`https://dark-sky.p.rapidapi.com/${latlong}`, {
        headers: {
          'x-rapidapi-host': 'dark-sky.p.rapidapi.com',
          'x-rapidapi-key': 'ef5bd20381msh560f1cf255757e6p1714e3jsn6b58f7566759'
        }
      })
        .then((res) => {
          console.log(res);
          return res.data;
        });
    }
    catch (err) {
      console.log(err);
    }

    return true;
  }

  /**
   * Gets the temperature stats from the weather API.
   */
  //function getTemps(stationId, startDate, endDate) {
  function getTemps(zip, startDate, endDate) {
    try {
      // @todo https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&locationid=ZIP:28801&startdate=2010-05-01&enddate=2010-05-01
        //dataTypes=DP01,DP05,DP10,DSND,DSNW,DT00,DT32,DX32,DX70,DX90,SNOW,PRCP&stations=ASN00084027&startDate=1952-01-01&endDate=1970-12-31&includeAttributes=true&format=json
      return axios.get('https://www.ncdc.noaa.gov/cdo-web/api/v2/data', {
        params: {
          datasetid: 'GSOM',
          //stations: stationId,
          locationid: `ZIP:${zip}`,
          startdate: '2019-11-14',
          enddate: '2020-11-13',
          //includemetadata: false,
          format: 'json'
        },
        headers: {
          token:'PjHrAchUAPuQHfYyImvVWZgMuYVcylgH'
        }
      })
        .then((res) => {
          console.log(res);
          if (res.data.results.length) {
            return res.data.results;
          }
          else {
            console.log(res);
            return null;
          }
        })
        .catch (err => console.error(err))
    }
    catch (err) {
      console.log(err);
    }
  }

})();
