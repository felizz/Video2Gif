var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/user');
var config = require('utils/config');
var logger = require('utils/logger');

module.exports = function(passport) {

    passport.use('facebook', new FacebookStrategy({
        clientID        : config.facebook.app_id,
        clientSecret    : config.facebook.app_secret
    }, function(access_token, refresh_token, profile, done) {
		
		// asynchronous
		process.nextTick(function() {

			// find the user in the database based on their facebook id
	        User.findOne({ 'fb_id' : profile.id }, function(err, user) {

				logger.info("huuthanhdlv" + JSON.stringify(profile));

	        	// if there is an error, stop everything and return that
	        	// ie an error connecting to the database
	            if (err)
	                return done(err);

				// if the user is found, then log them in
	            if (user) {
					logger.info(`user ${profile.id} already exist `);
	                return done(null, user); // user found, return that user
	            } else {

	                // if there is no user found with that facebook id, create them
	                var newUser = new User();
					// set all of the facebook information in our user model
	                newUser.fb_id    = profile.id; // set the users facebook id
					newUser.name  = profile.displayName;
					newUser.avatar = "https://graph.facebook.com/" + profile.id + "/picture";
	                //newUser.fb.email = profile.emails.value; // facebook can return multiple emails so we'll take the first

					// save our user to the database
	                newUser.save(function(err) {
	                    if (err)
	                        throw err;
						logger.info(`Successfuly create new user ${profile.id} `);
	                    // if successful, return the new user
	                    return done(null, newUser);
	                });
	            }

	        });
        });

    }));

};
