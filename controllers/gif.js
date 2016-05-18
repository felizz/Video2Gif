/**
 * Created by kyle on 9/5/16.
 */
/**
 * Created by kyle on 28/12/15.
 */

var statusCodes = require('infra/status-codes');
var errReason = require('infra/error-reason');
var apiErrors = require('infra/api-errors');
var youtubedl = require('youtube-dl');
var logger = require('utils/logger');
var validator = require('utils/validator');
var shortid = require('shortid');
var ffmpeg = require('fluent-ffmpeg');
var GIF_DIR = 'public/gifs/';
var fs = require('fs');


var user = {
    handleCreateGif: function (req, res) {
        logger.debug('Request Data = ' + JSON.stringify(req.body));

        var errRes = apiErrors.INVALID_PARAMETERS.new();

        //Request Validation
        if(!validator.isURL(req.body.video_url)){
            errRes.putError('video_url', errReason.INVALID_FORMAT);
        }

        if(!req.body.start_time || !validator.isNumeric(req.body.start_time.replace(/\./g, ""))){
            errRes.putError('start_time', errReason.INVALID_FORMAT);
        }

        if(!req.body.duration || !validator.isNumeric(req.body.duration.replace(/\./g, ""))){
            errRes.putError('duration', errReason.INVALID_FORMAT);
        }

        if (errRes.hasError()) {
            return errRes.sendWith(res);
        }

        var startTime = parseInt(req.body.start_time), duration = parseInt(req.body.duration);

        if(duration <= 0 || duration > 15) {
            errRes.putError('duration', errReason.OUT_OF_BOUND);
        }

        if (errRes.hasError()) {
            return errRes.sendWith(res);
        }

        logger.info('Start Youtube dl getInfo. URL = ' + req.body.video_url);

        youtubedl.getInfo(req.body.video_url, function(err, info) {
            if (err){
                logger.prettyError(err);
                return apiErrors.UNPROCESSABLE_ENTITY.new().sendWith(res);
            }

            logger.info('Info successfully retrieved for URL. Title : ' + info.title);
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
                        return apiErrors.UNPROCESSABLE_ENTITY.new().sendWith(res);
                    }

                    logger.info('Gif successfully saved to file : ' + fileName);
                    return res.status(statusCodes.OK).send({url: '/gifs/' + fileName, name: imageId});
                })
                .save(GIF_DIR + fileName);
        });
    }
};

module.exports = user;


