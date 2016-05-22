/**
 * Created by kyle on 29/12/15.
 */
var config = require('./' + (process.env.NODE_ENV || 'development') + '.json');

if(process.env.AWS_API_KEY){
    config.AWS.api_key = process.env.AWS_API_KEY;
    logger.info('AWS api key picked from environment');
}

if(process.env.AWS_API_SECRET){
    config.AWS.api_secret = process.env.AWS_API_SECRET;
    logger.info('AWS api secret picked from environment');
}

module.exports = config;