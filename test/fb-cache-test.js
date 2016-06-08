/**
 * Created by kyle on 7/6/16.
 */

var request = require('request');
var logger = require('utils/logger');


describe("Caching file to Facebook", function () {

    it(" should able to cache an url", function (done) {
        var url = 'http://anhdong.vn/Bk4GzdSE';

        var fbCacheURL  = 'https://graph.facebook.com?scrape=true&id=' + url;

        request.post(fbCacheURL, {timeout : 15000} ,
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
                done();
            });
    });
});