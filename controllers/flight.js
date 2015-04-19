var flight = require('../models/Flight.js');

exports.getFlights = function(req, res) {
  flight.Flight.find(function(err, docs) {
    res.render('flights', { flights: docs });
    console.log("GET FLIGHTS");
  });
};

exports.postFlight = function(req, res, next) {
  console.log("POST FLIGHTS RECEIVED");
  console.log("POST ALL: " + req);

  console.log("POST BODY: " + req.body);
  console.log("POST PARAMS: " + req.params);
  console.log("POST QUERY: " + req.query);
  console.log("POST HEADER: " + req.headers);
  res.end('Thanks for submitting a flight. It worked!');
};