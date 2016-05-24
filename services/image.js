/**
 * Created by kyle on 20/5/16.
 */

var youtubedl = require('youtube-dl');
var logger = require('utils/logger');
var shortid = require('shortid');
var ffmpeg = require('fluent-ffmpeg');
var GIF_DIR = 'public/images/';
var UnprocessableError = require('infra/errors/unprocessable-error');
var Image = require('../models/image');
var SHORT_LINK_DOMAIN = 'http://anhdong.vn/';
var DatabaseError = require('infra/errors/database-error');
var SNError = require('infra/errors/sn-error');
var NodeCache = require('node-cache');
var adCache = new NodeCache();
var CACHING_TTL = 10; //seconds
var serviceUtils = require('./utils');

module.exports = {
    getImageById: function (imageId, callback){
        Image.findById(imageId, function (err, image) {
            if (err) {
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }

            return callback(null, image);
        });
    },
    saveActionForImageById: function (loveNum, viewsNum, imageId, callback) {
        Image.findById(imageId, function (err, image) {
            if (err) {
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }
            image.viewNum = viewsNum;
            image.loveNum = loveNum;
            image.save();
            logger.info(`${loveNum} love and ${viewsNum} views was saved for image: ${imageId}`);
            return callback(null, image);
        });
    },

    extractGifFromVideo: function (videoUrl, imageId, startTime, duration, callback) {
        adCache.set(imageId, 1, CACHING_TTL);

        logger.info('Start Youtube dl getInfo. URL = ' + videoUrl);
        youtubedl.getInfo(videoUrl, function(err, info) {
            if (err){
                logger.prettyError(err);
                return callback(new UnprocessableError('Unable to retrieve video info : URL = ' + videoUrl));
            }

            logger.info('Info successfully retrieved for URL. Title : ' + info.title);
            var fileName = imageId + '.gif';
            ffmpeg(info.url).noAudio().seekInput(startTime)
                .outputFormat('gif').duration(duration).size('480x?')
                .on('start', function (commandLine) {
                    logger.info('Transcoding process started. Filename : ' + fileName);
                    adCache.set(imageId, 10, CACHING_TTL);
                })
                .on('error', function (err, stdout, stderr) {
                    logger.info('Cannot process video: ' + err.message);
                })
                .on('progress', function (progress) {
                    logger.debug('Progress : : ' + progress.timemark + ' seconds ' + imageId);
                    var currentTimeInSeconds = serviceUtils.convertVideoTimemarkToSeconds(progress.timemark);
                    var percentageCompleted = currentTimeInSeconds ? 10 + Math.floor(currentTimeInSeconds / duration * 85) : null;
                    adCache.set(imageId, percentageCompleted , CACHING_TTL);
                })
                .on('end', function () {
                    var newImage = new Image({
                        _id: imageId,
                        name: fileName,
                        direct_url: '/images/' + fileName,
                        source_video: videoUrl,
                        short_link: SHORT_LINK_DOMAIN + imageId
                    });

                    newImage.save(function (err){
                        if(err){
                            logger.prettyError(err);
                            return callback(new DatabaseError('Error saving image Id ' + imageId));
                        }

                        logger.info('Gif successfully saved to file : ' + fileName);
                        adCache.set(imageId, 100 , CACHING_TTL);
                        return callback(null, newImage);
                    });
                    logger.info('Gif successfully saved to file : ' + fileName);
                })
                .save(GIF_DIR + fileName);
        });
    },

    getPercentOfProgress: function (imageId, callback) {
        adCache.get(imageId, function( err, percentCompleted ){
            if(err || !percentCompleted){
                return callback(new SNError('No Caching record found for image id ' + imageId));
            }

            return callback(null, percentCompleted);
        });
    }
};