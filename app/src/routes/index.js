'use strict';

const fs = require('fs');
const express = require('express');
const router = express.Router();

module.exports = function(app) {

  // Load all routes defined in their own route file.
  fs.readdir(__dirname, (err, files) => {
    files.forEach((file) => {
      if (file.indexOf('.js') >= 0 && file !== 'index.js') {
        require(`./${file}`)(app); // eslint-disable-line global-require
      }
    });
  });

};
