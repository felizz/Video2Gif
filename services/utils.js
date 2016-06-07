/**
 * Created by kyle on 21/5/16.
 */
var request = require('request');
var logger = require('utils/logger');
module.exports = {
    convertVideoTimemarkToSeconds: function (timemark){
        var tokens = timemark.split(':');

        if(tokens.length !== 3){
            return null;
        }

        try{
            var hourValue =  parseInt(tokens[0]);
            var minuteValue = parseInt(tokens[1]);
            var secondValue = parseFloat(tokens[2]);

            if(hourValue < 0 || minuteValue < 0 || secondValue < 0 || minuteValue >= 60 || secondValue >= 60){
                return null;
            }

            return hourValue * 60 * 60 + minuteValue * 60 + secondValue;
        }
        catch (err){
            return null;
        }
    },

    cacheURLToFacebook : function (url){

        if(process.env.NODE_ENV !== 'production'){
            return;
        }

        var fbCacheURL  = 'https://graph.facebook.com?scrape=true&id=' + url;

        request.post(fbCacheURL, null ,
            function optionalCallback(err, httpResponse, body) {
                if (err) {
                    logger.debug('Failed to facebook-cache  url : ' + url);
                }
                else if( httpResponse.statusCode !== 200){
                    logger.debug('Retry fb caching url: ' + url);
                    request.post(fbCacheURL);
                }
                else {
                    logger.debug('facebook-cacheing url ' + url + ' succeeded : Response: ' + body);
                }
            });
    }
};