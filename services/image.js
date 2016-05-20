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
module.exports = {
    getImageById: function (imageId, callback){
        Image.findById(imageId, function (err, image) {
            if (err) {
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }

            return callback(null, image);
        });
    },

    extractGifFromVideo: function (video_url, startTime, duration, callback) {
        youtubedl.getInfo(video_url, function(err, info) {
            if (err){
                logger.prettyError(err);
                return callback(new UnprocessableError('Unable to retrieve video info : URL = ' + video_url));
            }

            logger.debug('Info successfully retrieved for URL. Title : ' + info.title);
            var imageId = shortid.generate();
            var fileName = imageId + '.gif';

            ffmpeg(info.url).noAudio().seekInput(startTime)
                .outputFormat('gif').duration(duration).size('640x?')
                .on('start', function () {
                    logger.info('Transcoding process started. Filename : ' + fileName);
                })
                .on('error', function (err, stdout, stderr) {
                    logger.info('Cannot process video: ' + err.message);
                })
                .on('end', function () {
                    if (err) {
                        logger.prettyError(err);
                        return callback(new UnprocessableError('Unable to extract gif from video URL = ' + video_url));
                    }

                    var newImage = new Image({
                        _id: imageId,
                        name: fileName,
                        direct_url: '/images/' + fileName,
                        source_video: video_url,
                        short_link: SHORT_LINK_DOMAIN + imageId

                    });

                    newImage.save(function (err){
                        if(err){
                            logger.prettyError(err);
                            return callback(new DatabaseError('Error saving image Id ' + imageId));
                        }

                        logger.info('Gif successfully saved to file : ' + fileName);
                        return callback(null, newImage);
                    });
                })
                .save(GIF_DIR + fileName);
        });
    }
};