/**
 * Created by huunguyen on 6/4/15.
 */
var crypto = require('crypto');
var config = require('../config/config');
var symestricAlgorithm = 'aes-256-ctr';
var securityPassword = config['INSPIUS_PRIVATE_STRING'];
//This need to be easy to remember as all the validity of the password depend on this.
var passwordHashSecurityKey = config['INSPIUS_PASSWORD_HASH'];


var security = {
    secureHash: function (message){
        var hash = crypto.createHmac('sha512', securityPassword);
        hash.update(message);
        return hash.digest('hex');
    },

    passwordHash: function (message){
        console.log(message);
        var hash = crypto.createHmac('sha512', passwordHashSecurityKey);
        hash.update(message);
        return hash.digest('hex');
    },

    symestricEncrypt: function (message){
        var cipher = crypto.createCipher(symestricAlgorithm, securityPassword);
        var crypted = cipher.update(message,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;

    },
    symestricDecrypt: function (digest){
        var decipher = crypto.createDecipher(symestricAlgorithm, securityPassword);
        var dec = decipher.update(digest,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    },
    generateTimedToken: function (message){
        return security.secureHash(new Date().toTimeString() + message);
    }

};

module.exports = security;
