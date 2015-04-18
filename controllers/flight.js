var flight = require('../models/Flight.js');

exports.getFlights = function(req, res) {
  flight.Flight.find(function(err, docs) {
    res.render('flights', { flights: docs });
    console.log(docs);
  });
};
