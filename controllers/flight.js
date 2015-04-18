var flight = require('../models/Flight.js');

exports.getFlights = function(req, res) {
  flight.Flight.find(function(err, docs) {
    res.render('flights', { flights: docs });
    console.log("GET FLIGHTS");
  });
};

exports.postFlight = function(req, res, next) {
  console.log("POST FLIGHTS RECEIVED");
  console.log(req.body);
  res.end('Thanks for submitting a flight. It worked!');
};