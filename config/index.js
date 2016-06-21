/**
 * Created by kyle on 29/12/15.
 */
var config = require('./' + (process.env.NODE_ENV || 'development') + '.json');

try {
    if(process.env.NODE_ENV === 'production') {
        var productionConfig  = require(process.env.HOME + '/.ad/config');

        config.AWS.api_key = productionConfig.AWS.api_key;
        config.AWS.api_secret = productionConfig.AWS.api_secret;

        config.facebook.app_id = productionConfig.facebook.app_id;
        config.facebook.app_secret = productionConfig.facebook.app_secret;

        console.log('Loaded configurations from production environment!');
    }
}
catch (err){
    console.log('No production config file found at ~/.ad/config');
    console.log(err);
}

module.exports = config;