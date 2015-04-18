var mongoose = require('mongoose'),
	flight = require('./models/Flight');

module.exports = {
	/* Check if the db is empty */
	check : function() {
		// Listings
		flight.Flight.find({}, function(err, flights){
			if (flights.length === 0) {
				
				console.log('No flights found; Seeding...');

				// dummy flight 1
				var newFlight = new flight.Flight({
					origin : 'JFK',
					destination : 'SEA',
					distance : 5000,
					price : 1000,
					carbon : 10000,
					departureDate: new Date(2014, 12, 2, 12, 00, 00, 00),
					arrivalDate: new Date(2014, 12, 3, 3, 00, 00, 00),
				});

				newFlight.save(function(err, flight){
					console.log('Successfully inserted flight: ' + flight._id);
				});

				// dummy flight 2
				var newFlight2 = new flight.Flight({
					origin : 'SEA',
					destination : 'BOS',
					distance : 7000,
					price : 500,
					carbon : 13000,
					departureDate: new Date(2014, 12, 23, 8, 00, 00, 00),
					arrivalDate: new Date(2014, 12, 23, 14, 00, 00, 00),
				});

				newFlight2.save(function(err, flight){
					console.log('Successfully inserted flight: ' + flight._id);
				});


				// dummy flight 3
				var newFlight3 = new flight.Flight({
					origin : 'MIA',
					destination : 'DEN',
					distance : 3000,
					price : 249,
					carbon : 8920,
					departureDate: new Date(2014, 11, 15, 21, 00, 00, 00),
					arrivalDate: new Date(2014, 11, 16, 1, 30, 00, 00),
				});

				newFlight3.save(function(err, flight){
					console.log('Successfully inserted flight: ' + flight._id);
				});

			} else {
				console.log('Found ' + flights.length + ' existing flights');
			}
		});
	
	}
}
