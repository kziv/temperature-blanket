/**
 * Main functionality.
 *
 * @todo include axios here instead of in the HTML.
 * @todo toggle for colors per column vs colors for whole project.
 * @todo toggle for date order (default is oldest first)
 * @todo print stylesheet
 */
;(function () {
  'use strict';

  const baseUrl = '/api';
  const table_id = 'table-results';

  // These will be populated as the form is filled out
  // so we don't have to calculate them again.
  let start_date;
  let end_date;
  let weather_data;

  // Form fields for easy reference.
  let field_start_date = document.getElementById('field-date-start');
  let field_end_date = document.getElementById('field-date-end');

  // Attach event handler to start date change.
  field_start_date.addEventListener('focusout', (e) => {
    // Clear out any existing weather data;
    weather_data = null;

    // Always set the start date for later calculation.
    start_date = calculateLocalDate(field_start_date);

    // If there's a start date but no end date,
    // et the end date field value a year minus one day from the start date.
    if (field_start_date.value && !field_end_date.value) {
      let end_date_raw = new Date(start_date); // Clone the start date as to not modify it.
      end_date_raw = new Date(end_date_raw.setFullYear(end_date_raw.getFullYear() + 1));
      end_date = new Date(end_date_raw.setDate(end_date_raw.getDate() - 1));
      field_end_date.value = end_date.toISOString().split('T')[0];
    }

    // Validate the date range. This goes last in case we're changing the value after
    // initially populating it so you don't get date comparison issues when the end
    // date field is still empty.
    validateDateRange(e.target);
  });

  // Attach event handler to end date change.
  field_end_date.addEventListener('focusout', (e) => {
    // Clear out any existing weather data;
    weather_data = null;

    end_date = calculateLocalDate(e.target);

    // Validate the date range.
    validateDateRange(e.target);
  });

  // Attach event handler to form submit.
  document.getElementById('form-specs').addEventListener('submit', (e) => {
    e.preventDefault();

    // Make sure the form has valid data.
    e.target.reportValidity();

    // If we already have weather data, no need to ping the APIs again.
    // Just use the existing data.
    if (weather_data) {
      const markup = parseWeatherData(weather_data);
      return writeMarkup(markup);
    }

    // Use the submitted address data to get the coordinates for looking up weather data.
    const zip = document.getElementById('field-zip').value;
    return getLatLongByAddress(zip)
      .then((data) => {
        // Calculate optional params.
        data.start_date = start_date;
        data.end_date = end_date;

        return getWeather(data);
      })
      .then((data) => {
        // Set this globally so we don't have to ping the API
        // for just sorting and other data munging operations.
        weather_data = data;
        return parseWeatherData(data);
      })
      .then((markup) => {
        return writeMarkup(markup);
      });
  });

  /**
   * Gets the lat/long by location.
   */
  function getLatLongByAddress(address) {
    try {
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
      // Set the required search parameters for the api.
      const params = {
        latitude: data.latitude,
        longitude: data.longitude,
      };

      // Both start and end dates need to be populated
      // to override the server-side defaults.
      // @todo client side validation for these fields.
      if (data.start_date && data.end_date) {
        params.start_date = data.start_date.toISOString().split('T')[0];
        params.end_date = data.end_date.toISOString().split('T')[0];
      }

      // Only get the requested stats.
      const stats_checked = document.querySelectorAll('input[name="stats"]:checked');
      const selected = Array.from(stats_checked).map(x => x.value);
      if (!selected.length) {
        // Mean is the default.
        selected.push('mean');
      }
      params.stats = Array.from(selected).map(x => 'temperature_2m_' + x).join(',');

      // Get the data from the API.
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
    // Start the markup for the new table.
    let markup = `<table id="${table_id}" class="table table-striped table-bordered table-sm mt-3 sortable">`;

    // Create the columns first.
    markup += '<thead><tr>';
    const column_order = getColumnOrder();
    for (const col of column_order) {
      // If the column exists in the result data...
      if (data.daily.hasOwnProperty(col)) {
        markup += col === 'time'
          ? `<th id="col-head-time" role="button">${getColumnNameForField(col)}</th>`
          : `<th colspan="2" class="text-center">${getColumnNameForField(col)}</th>`;
      }
    }
    markup += '</tr></thead>';

    // Calculate the color values for each column.
    const total_colors = document.getElementById('field-colors-count').value;
    let color_chart = {};
    for (const col of column_order) {
      if (data.daily.hasOwnProperty(col) && col !== 'time') {
        const min = Math.min(... data.daily[col]); // Lowest temp.
        const max = Math.max(... data.daily[col]); // Highest temp.
        color_chart[col] = {
          min: min,
          max: max,
          size: (max - min) / total_colors // Size of single color range.
        };
      }
    }

    // Weather is returned as an array for each data point, including data.
    markup += '<tbody>';
    for (let i = 0; i < data.daily.time.length; i++) {
      markup += '<tr>';
      // We need to output the columns in order.
      for (const col of column_order) {
        // Only output columns that exist.
        if (data.daily.hasOwnProperty(col)) {
          // Color.
          if (col !== 'time') {
            const color = calculateColor(data.daily[col][i], color_chart[col].min, color_chart[col].size);
            markup += `<td>${color}</td>`;
          }

          // Value.
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

  /**
   * Writes the actual markup. Not sure why I broke this out.
   */
  function writeMarkup(markup) {
    // If there's already a table, remove it so we can recreate it
    // base on the data munging parameters.
    const table = document.getElementById(table_id);
    if (table) {
      table.remove();
    }

    document.getElementById('results').innerHTML = markup;

    // Attach event handler for the date column to allow sorting.
    document.getElementById('col-head-time').addEventListener('click', (e) => {
      toggleTableRows();
    });
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

  /**
   * Gets the color number.
   */
  function calculateColor(val, min_val, color_size) {
    const color = Math.ceil((val - min_val) / color_size);
    return color === 0
      ? 1
      : color;
  }

  function toggleTableRows() {
    // Get all the table rows.
    const tbody = document.querySelectorAll(`#${table_id} tbody`)[0];
    const rows = tbody.getElementsByTagName('tr');

    // The rows are an HTMLCollection so we need to convert them to
    // an array before reversing the order.
    const reversed_rows = [].slice.call(rows, 0).reverse();

    // Clear out the existing rows and rewrite them, now reversed.
    while (rows.length > 0) {
      rows[0].remove();
    }
    for (const row of reversed_rows) {
      tbody.appendChild(row);
    }
  }

  function updateDateRanges() {
    // If there's a start date but no end date...
    const start_date_raw = document.getElementById('field-date-start').valueAsDate;
    const end_date_field = document.getElementById('field-date-end');
    if (start_date_raw && !end_date_field.value) {
      // Adjust for the UTC offset. Whatever the user entered they want that actual date.
      const start_date_utc = new Date(start_date_raw.getUTCFullYear(), start_date_raw.getUTCMonth(), start_date_raw.getUTCDate());
      start_date = new Date(start_date_utc);

      // Calculate a year minus 1 day from the start date.
      const end_date_raw = new Date(start_date_utc.setFullYear(start_date_utc.getFullYear() + 1));
      end_date = new Date(end_date_raw.setDate(end_date_raw.getDate() - 1));
      end_date_field.value = end_date.toISOString().split('T')[0];
    }
  }

  function calculateLocalDate(el) {
    const raw = el.valueAsDate;
    const utc = new Date(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate());
    return utc;
  }

  function validateDateRange(el) {
    // Start date must be before end date.
    if (start_date > end_date) {
      const msg = 'The end date must be later than the start date.';
      el.setCustomValidity(msg);

      // We don't need to do any more validation.
      return false;
    }
    else {
      el.setCustomValidity('');
    }

    // End date must be at least a week ago.
    return true;
  }

})();
