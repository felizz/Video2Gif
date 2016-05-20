/**
 * Created by kyle on 20/5/16.
 */

var youtubedl = require('youtube-dl');
var logger = require('utils/logger');
var shortid = require('shortid');
var ffmpeg = require('fluent-ffmpeg');
var GIF_DIR = 'public/gifs/';
var UnprocessableError = require('infra/errors/unprocessable-error');


module.exports = {
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

                    logger.info('Gif successfully saved to file : ' + fileName);
                    return callback(null, imageId);
                })
                .save(GIF_DIR + fileName);
        });
    }
};