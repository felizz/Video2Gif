var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var fbConfig = require('../fb.js');
var logger = require('utils/logger');

module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
        clientID        : fbConfig.appID,
        clientSecret    : fbConfig.appSecret,
        callbackURL     : fbConfig.callbackUrl
    }, function(access_token, refresh_token, profile, done) {
		console.log("in strategy");
		logger.info("profile"+profile.id+"loged in facebook");
    	console.log('profile', profile);
		// asynchronous

		return done(null, false);
    }));
};
