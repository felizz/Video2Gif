/**
 * Created by huunguyen on 6/4/15.
 */
var crypto = require('crypto');
var config = require('../config');

var security = {
    //Generate SHA512 Hash of the message
    secureHash: function (message) {
        var hash = crypto.createHmac('sha512', config.security.hash_secret_key);
        hash.update(message);
        return hash.digest('hex');
    },

    // Generate a token which is associated with current time
    generateTimedToken: function (message) {
        return security.secureHash(new Date().toTimeString() + message);
    }

};

module.exports = security;
