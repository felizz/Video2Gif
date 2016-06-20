/**
 * Created by Tuanguyen on 20/06/2016.
 */

var apiErrors = require('infra/api-errors');

module.exports = {

    /* Check if request is authenticated */
    isAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        else {
            return apiErrors.AUTHENTICATION_ERROR.new('You need to login before performing the request!').sendWith(res);
        }
    },

    /* Check if request is not authenticated */
    verifyNotLoggedIn: function (req, res, next) {
        if (req.isAuthenticated()) {
            return apiErrors.AUTHENTICATION_ERROR.new('Please logout before login again!').sendWith(res);
        } else {
            return next();
        }
    }
};