var flight = require('../models/Flight.js');

var http = require('http'),
    inspect = require('util').inspect;

var Busboy = require('busboy');

exports.getFlights = function(req, res) {
	flight.Flight.find(function(err, docs) {
		res.render('flights', { flights: docs });
		console.log("GET FLIGHTS");
	});
};

exports.postFlight = function(req, res, next) {

	var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
      console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
      file.on('data', function(data) {
        console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      });
      file.on('end', function() {
        console.log('File [' + fieldname + '] Finished');
      });
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.on('finish', function() {
      console.log('Done parsing form!');
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });
    req.pipe(busboy);
};

