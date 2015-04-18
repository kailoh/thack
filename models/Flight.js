var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

var Flight = new Schema({
	origin: { type : String}, //airport code
	destination: { type : String} , //airport code
	distance: { type : Number}, //distance in miles
	price: { type: Number}, //price of flight
	carbon: { type: Number}, //carbon emissions
	departureDate: { type: Date },
	arrivalDate: { type: Date }
});

module.exports = {
	Flight : mongoose.model('Flight', Flight)
}