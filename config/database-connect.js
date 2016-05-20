/**
 * Created by kyle on 20/5/16.
 */
//connect mongodb
var mongoose = require('mongoose');
var logger = require('utils/logger');
mongoose.connect('mongodb://localhost/anhdong');
mongoose.set('debug', true);
var db = mongoose.connection;
db.on('error', function(err){
    logger.info('Database connect err ' + err.message)
});
db.once('open', function () {
    logger.info('Database connected.');
});
module.exports = db;

