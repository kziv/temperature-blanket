/**
 * Main functionality.
 *
 * @todo include axios here instead of in the HTML.
 */
;(function () {
  'use strict';

  const baseUrl = 'http://localhost:3000';

  // These will be populated as the form is filled out
  // so we don't have to calculate them again.
  let start_date;
  let end_date;

  // Attach event handler to start date change.
  document.getElementById('field-date-start').addEventListener('focusout', (e) => {
    // If there's a start date but no end date...
    const start_date_raw = document.getElementById('field-date-start').valueAsDate;
    const end_date_field = document.getElementById('field-date-end');
    if (start_date_raw && !end_date_field.value) {
      const start_date_utc = new Date(start_date_raw.getUTCFullYear(), start_date_raw.getUTCMonth(), start_date_raw.getUTCDate());
      start_date = start_date_utc;
      // Calculate a year minus 1 day from the start date.
      const end_date_raw = new Date(start_date_utc.setFullYear(start_date_utc.getFullYear() + 1));
      end_date = new Date(end_date_raw.setDate(end_date_raw.getDate() - 1));
      end_date_field.value = end_date.toISOString().split('T')[0];
    }
  });

  // Attach event handler to form submit.
  document.getElementById('form-specs').addEventListener('submit', (e) => {
    e.preventDefault();

    // Use the submitted address data to get the coordinates for looking up weather data.
    const zip = document.getElementById('field-zip').value;
    getLatLongByAddress(zip)
      .then((data) => {
        // Calculate optional params.
        data.start_date = start_date;
        data.end_date = end_date;

        return getWeather(data);
      })
      .then((data) => {
        const markup = parseWeatherData(data);
        document.getElementById('results').innerHTML = markup;
      });
  });

  /**
   * Gets the lat/long by location.
   */
  function getLatLongByAddress(address) {
    try {
      // @todo replace this with base url config.
      return axios.get(`${baseUrl}/location`, {
        crossDomain: true,
        params: {
          address: address
        }
      })
        .then((res) => {
          // @todo error handling
          return res.data;
        })
        .catch (err => console.error(err));
    }
    catch (err) {
      console.log(err);
    }

    return true;
  }

  /**
   * Gets weather data for a given location.
   */
  function getWeather(data) {
    try {
      // Set the search parameters for the api.
      const params = {
        latitude: data.latitude,
        longitude: data.longitude,
      };

      if (data.start_date && data.end_date) {
        params.start_date = data.start_date.toISOString().split('T')[0];
        params.end_date = data.end_date.toISOString().split('T')[0];
      }

      return axios.get(`${baseUrl}/weather`, {
        crossDomain: true,
        params: params
      })
        .then((res) => {
          return res.data;
        });
    }
    catch (err) {
      console.log(err);
    }

    return true;
  }

  /**
   * Parses the weather data into a format that can be output.
   */
  function parseWeatherData(data) {
    let markup = '<table class="table table-striped table-bordered table-sm">';

    // Create the columns first.
    markup += '<thead><tr>';
    const column_order = getColumnOrder();
    for (const col of column_order) {
      // If the column exists in the result data...
      if (data.daily.hasOwnProperty(col)) {
        markup += `<th>${getColumnNameForField(col)}</th>`;
      }
    }
    markup += '</tr></thead>';

    // Weather is returned as an array for each data point, including data.
    markup += '<tbody>';
    for (let i = 0; i < data.daily.time.length; i++) {
      markup += '<tr>';
      // We need to output the columsn in order.
      for (const col of column_order) {
        // Only output columns that exist.
        if (data.daily.hasOwnProperty(col)) {
          markup += `<td>${data.daily[col][i]}</td>`;
        }
      }
      markup += '</tr>';
    }
    markup += '</tbody>';

    // Close the table.
    markup += '</table>';

    return markup;
  }

  function getColumnNameForField(field) {
    switch (field) {
      case 'time':
        return 'Date';
      case 'temperature_2m_max':
        return 'High Temp';
      case 'temperature_2m_min':
        return 'Low Temp';
      case 'temperature_2m_mean':
        return 'Avg Temp';
    }
    return field;
  }

  function getColumnOrder() {
    return [
      'time',
      'temperature_2m_min',
      'temperature_2m_max',
      'temperature_2m_mean'
    ];
  }

})();
