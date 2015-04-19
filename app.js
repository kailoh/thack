/**
 * Module dependencies.
 */
 var express = require('express');
 var cookieParser = require('cookie-parser');
 var compress = require('compression');
 var session = require('express-session');
 var bodyParser = require('body-parser');
 var logger = require('morgan');
 var errorHandler = require('errorhandler');
 var methodOverride = require('method-override');
 var multer  = require('multer');

 var _ = require('lodash');
 var MongoStore = require('connect-mongo')(session);
 var flash = require('express-flash');
 var path = require('path');
 var mongoose = require('mongoose');
 var passport = require('passport');
 var expressValidator = require('express-validator');
 var connectAssets = require('connect-assets');

 var seeder = require('./seeder');

/**
 * Controllers (route handlers).
 */
 var homeController = require('./controllers/home');
 var userController = require('./controllers/user');
 var apiController = require('./controllers/api');
 var flightController = require('./controllers/flight');

/**
 * API keys and Passport configuration.
 */
 var secrets = require('./config/secrets');
 var passportConf = require('./config/passport');

/**
 * Create Express server.
 */
 var app = express();

/**
 * Connect to MongoDB.
 */
 mongoose.connect(secrets.db);
 mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});
 mongoose.connection.on('open', function() {
  console.log('Connected to db...');
  console.log('environment: ' + app.get('env'));
  if (app.get('env') == 'development'){
    seeder.check();
  }
});

/**
 * Express configuration.
 */
 app.set('port', process.env.PORT || 3000);
 app.set('views', path.join(__dirname, 'views'));
 app.set('view engine', 'jade');
 app.use(compress());
 app.use(connectAssets({
  paths: [path.join(__dirname, 'public/css'), path.join(__dirname, 'public/js')]
}));
 app.use(logger('dev'));
 app.use(bodyParser.json());
 app.use(bodyParser.urlencoded({ extended: true }));


function calculateDistance(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = (R * c)/1.60934; // Distance in miles
  console.log("D: " + d);
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

app.use(multer({ dest: path.join(__dirname, 'uploads'),

  onFileUploadComplete: function (file, req, res) {
    console.log(file.fieldname + ' uploaded to  ' + file.path);

    fs = require('fs')
    fs.readFile(file.path, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      var origin;
      var destination;
      var distance;
      var price;
      var carbon;
      var departureDate;
      var arrivalDate;
      var duration;

      air0 = data.match(/<airport-code>(.*?)<\/airport-code>/g)[0];
      air1 = data.match(/<airport-code>(.*?)<\/airport-code>/g)[1];
      origin = air0.replace(/<\/?airport-code>/g,'');
      destination = air1.replace(/<\/?airport-code>/g,'');

      data.match(/<utc-date-time>(.*?)<\/utc-date-time>/g).map(function(val){
        var dateTimeArray = val.replace(/<\/?utc-date-time>/g,'');
        departureDate = dateTimeArray[0];
        arrivalDate = dateTimeArray[1];
      });

      var lat0, lat1, long0, long1;

      data.match(/<latitude>(.*?)<\/latitude>/g).map(function(val){
        var latArray = val.replace(/<\/?latitude>/g,'');
        lat0 = latArray[0];
        lat1 = latArray[1];
      });

      data.match(/<longitude>(.*?)<\/longitude>/g).map(function(val){
        var longArray = val.replace(/<\/?longitude>/g,'');
        long0 = longArray[0];
        long1 = longArray[1];
      });

      // console.log("lat0: " + lat0);
      // console.log("lat1: " + lat1);
      // console.log("long0: " + long0);
      // console.log("long1: " + long1);

      distance = calculateDistance(lat0, long0, lat1, long1);

      data.match(/<duration>(.*?)<\/duration>/g).map(function(val){
        duration = val.replace(/<\/?duration>/g,'');
      });

      data.match(/<total-cost>(.*?)<\/total-cost>/g).map(function(val){
        price = val.replace(/<\/?total-cost>/g,'');
      });

      // console.log("Here's the parsed data:");
      console.log("origin: " + origin);
      console.log("destination: " + destination);
      // console.log("distance: " + distance);
      console.log("price: " + price);
      // console.log("carbon: " + carbon);
      // console.log("departureDate: " + departureDate);
      // console.log("arrivalDate: " + arrivalDate);
      // console.log("duration: " + duration);
    });
  }
}));


 app.use(expressValidator());
 app.use(methodOverride());
 app.use(cookieParser());
 app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secrets.sessionSecret,
  store: new MongoStore({ url: secrets.db, autoReconnect: true })
}));
 app.use(passport.initialize());
 app.use(passport.session());
 app.use(flash());
 app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
 app.use(function(req, res, next) {
  if (/api/i.test(req.path)) req.session.returnTo = req.path;
  next();
});
 app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
 app.get('/', homeController.index);
 app.get('/login', userController.getLogin);
 app.post('/login', userController.postLogin);
 app.get('/logout', userController.logout);
 app.get('/forgot', userController.getForgot);
 app.post('/forgot', userController.postForgot);
 app.get('/reset/:token', userController.getReset);
 app.post('/reset/:token', userController.postReset);
 app.get('/signup', userController.getSignup);
 app.post('/signup', userController.postSignup);
 app.get('/account', passportConf.isAuthenticated, userController.getAccount);
 app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
 app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
 app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
 app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);

/**
 * API examples routes.
 */
 app.get('/api', apiController.getApi);
 app.get('/api/facebook', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getFacebook);
 app.get('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.getTwitter);
 app.post('/api/twitter', passportConf.isAuthenticated, passportConf.isAuthorized, apiController.postTwitter);

/**
 * OAuth authentication routes. (Sign in)
 */

 app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email', 'user_location'] }));
 app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
 app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
 app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});
 app.get('/auth/twitter', passport.authenticate('twitter'));
 app.get('/auth/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/login' }), function(req, res) {
  res.redirect(req.session.returnTo || '/');
});

/**
Custom app routes
**/
app.get('/flights', flightController.getFlights);
app.post('/flights', flightController.postFlight);

/**
 * Error Handler.
 */
 app.use(errorHandler());

/**
 * Start Express server.
 */
 app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

 module.exports = app;
