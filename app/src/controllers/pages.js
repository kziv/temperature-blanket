'use strict';

/**
 * Static pages.
 */
class Controller {

  home = async (req, res) => {
    res.render('index');
  }

}

module.exports = new Controller();
