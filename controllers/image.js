/**
 * Created by kyle on 9/5/16.
 */
/**
 * Created by kyle on 28/12/15.
 */

var statusCodes = require('infra/status-codes');
var errReason = require('infra/error-reason');
var apiErrors = require('infra/api-errors');
var logger = require('utils/logger');
var validator = require('utils/validator');
var serviceGif = require('../services/image');
var serviceS3Upload = require('../services/aws-s3-upload-queue');
var shortid = require('shortid');

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

        var imageId = shortid.generate();
        serviceGif.extractGifFromVideo(req.body.video_url, imageId, startTime, duration, function extractVideoCallback(err, image){
            if(err){
                logger.prettyError(err);
                //return apiErrors.UNPROCESSABLE_ENTITY.new().sendWith(res);
            }

            console.log("anh nhan duoc: "+image);
            //return res.status(statusCodes.OK).send(imageId);
            serviceS3Upload.queueGifForS3Upload(imageId, function callback(err, image){
                if(err){
                    logger.prettyError(err);
                }

                logger.info(`Image ${image.id} moved to S3`);
            });
        });
        return res.status(statusCodes.OK).send(imageId);
    },

    handlePollProgress: function (req,res) {
        var imageId = req.body.imageId;
        var duration = req.body.duration;
        console.log("da nhan dc: "+imageId);
        serviceGif.getPercentOfProgress(imageId, duration, function callback(err, percent) {
            if(err){
                res.status(statusCodes.OK).send("0");
            }
            logger.info("percent of image id: "+imageId+" : "+percent);
            return res.status(statusCodes.OK).send(percent);
        })
    }
};

module.exports = user;


