/**
 * Created by kyle on 29/12/15.
 */
var config = require('./' + (process.env.NODE_ENV || 'development') + '.json');
var fs = require('fs');
fs.stat('~/.aws/aws_credentials', function (err, stats){
    if(err || !stats.isFile()){
        return;
    }
    var aws_credentials  = require('~/.aws/aws_credentials');
    config.AWS.api_key = aws_credentials.api_key;
    config.AWS.api_secret = aws_credentials.api_secret;
});

module.exports = config;