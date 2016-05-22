/**
 * Created by kyle on 29/12/15.
 */
var config = require('./' + (process.env.NODE_ENV || 'development') + '.json');
var logger = require('utils/logger');

if(!config.AWS.api_key){
    var aws_credentials  = require(process.env.HOME + '/.aws/aws_credentials');
    config.AWS.api_key = aws_credentials.api_key;
    config.AWS.api_secret = aws_credentials.api_secret;
    logger.info('AWS Credentials loaded from ~/.aws/aws_credentials');
}

module.exports = config;