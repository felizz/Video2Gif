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

        var imageId = shortid.generate();
        serviceGif.extractGifFromVideo(req.body.video_url, imageId, startTime, duration, function extractVideoCallback(err, image){
            if(err){
                logger.prettyError(err);
                logger.error(`Failed to extract image ${image.id} from video ${req.body.video_url}`);
            }

            serviceS3Upload.queueGifForS3Upload(imageId, function callback(err, image){
                if(err){
                    logger.prettyError(err);
                    logger.error(`Failed to move image ${image.id} moved to S3`);
                }

                logger.info(`Image ${image.id} moved to S3`);
            });

            logger.info(`Successfuly extracted Gif ${imageId} from video URL ${req.body.video_url}`);
        });

        logger.info(`Gif Extraction from video ${req.body.video_url} to ${imageId} started.`);
        return res.status(statusCodes.OK).send({image_id : imageId});
    },

    handlePollImageProgress: function (req, res) {
        var imageId = req.body.image_id;

        serviceGif.getPercentOfProgress(imageId, function callback(err, percentCompleted) {
            if(err){
                return apiErrors.RESOURCE_NOT_FOUND.new().sendWith(res);
            }

            logger.info(`Percent completed of image ${imageId} : ${percentCompleted} %`);
            return res.status(statusCodes.OK).send({percent_completed: percentCompleted});
        })
    }
};

module.exports = user;


