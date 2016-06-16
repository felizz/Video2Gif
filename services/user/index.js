/**
 * Created by kyle on 29/12/15.
 */
var logger = require('utils/logger');
var user = {
    signup: function (email, callback) {
        //Signup Logic Goes Here
        // Create new user with this email
        //Send email with password to this email
        logger.info("Signup Service Called on " + email);
        callback(null);
    }


};

module.exports = user;