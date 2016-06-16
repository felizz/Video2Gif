/**
 * Created by Tuanguyen on 16/06/2016.
 */
var logger = require('utils/logger');
var User = require('../models/user');
var DatabaseError = require('infra/errors/database-error');
var RecordNotFoundError = require('infra/errors/record-not-found-error');

var user = {
    getUserInfoById: function (user_id, callback) {
        User.findOne({'_id': user_id}, function (err, user) {
            if (err) {
                return callback(new DatabaseError(`user Id ${user_id} not found in database`));
            }
            if(user == null){
                return callback(new RecordNotFoundError(`user Id ${user_id} not found in database`));
            }
            return callback(null, user);
        })
    }
};

module.exports = user;