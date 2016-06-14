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
var serviceImage = require('../services/image');
var serviceS3Upload = require('../services/aws-s3-upload-queue');
var serviceUtils = require('../services/utils');
var shortid = require('shortid');
var multer  = require('multer');
var passport = require('passport');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, serviceImage.GIF_DIR);
    },

    filename: function (req, file, cb) {
        cb(null, shortid.generate() +  ".gif");
    }
});

var upload = multer({ storage: storage,   limits: {fileSize: 4 * 1024 * 1024} });


var image = {
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
        serviceImage.extractGifFromVideo(req.body.video_url, imageId, startTime, duration + 1, function extractVideoCallback(err, image){
            if(err){
                logger.prettyError(err);
                logger.error(`Failed to extract image ${imageId} from video ${req.body.video_url}`);
            }

            serviceS3Upload.queueGifForS3Upload(imageId, function callback(err, image){
                if(err){
                    logger.prettyError(err);
                    logger.error(`Failed to move image ${imageId} moved to S3`);
                }

                logger.info(`Image ${imageId} moved to S3`);
                serviceUtils.precacheURLToFacebook(image.short_link);
            });

            logger.info(`Successfuly extracted Gif ${imageId} from video URL ${req.body.video_url}`);
        });

        logger.info(`Gif Extraction from video ${req.body.video_url} to ${imageId} started.`);
        return res.status(statusCodes.OK).send({image_id : imageId});
    },

    handlePollImageProgress: function (req, res) {
        var imageId = req.params.image_id;

        logger.debug('Received Data: ' + imageId);
        serviceImage.getPercentOfProgress(imageId, function callback(err, percentCompleted) {
            if(err){
                return apiErrors.RESOURCE_NOT_FOUND.new().sendWith(res);
            }

            logger.info(`Percent completed of image ${imageId} : ${percentCompleted} %`);
            return res.status(statusCodes.OK).send({percent_completed: percentCompleted});
        })
    },

    handleLove: function (req,res) {
        var loveVal = req.body.love_val;
        var imageId = req.params.image_id;

        logger.debug('Received loveVal : ' + loveVal);
        logger.debug('Received ID : ' + imageId);
        serviceImage.processLoveForImageById(imageId, loveVal, function callback(err, image) {

            if(err){
                logger.info(err);
                return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
            }
            return res.status(statusCodes.OK).send({love_count: image.love_count});
        })
    },
    handleClaimImage: function (req, res) {
        var user_id = req.body.user_id;
        var image_id= req.body.image_id;
        //check body
        serviceImage.updateOwnerId(image_id, user_id, function (err, image) {
            if(err){
                logger.prettyError(err);
                return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
            }
            return res.status(statusCodes.NO_CONTENT).send();
        })
    },
    handleLoginToClaim: function (req,res,next) {
        passport.authenticate(
            'facebook',
            {
                callbackURL: 'http://localhost:6767/user/login/facebook/callback/H1jeGl6N'
            }
        )(req, res, next);
    },
    handleLoginToClaimCallback: function (req,res,next) {
        passport.authenticate(
            'facebook',
            {
                callbackURL: 'http://localhost:6767/user/login/facebook/callback/'+req.params.id,
                successRedirect:'/'+req.params.id,
                failureRedirect:'/'
            }
        )(req,res,next);

    },

    handleUpdateTitle: function (req, res) {
        var newTitle = req.body.new_title;
        var imageId = req.params.image_id;

        logger.debug('new title: '+ newTitle);
        logger.debug('image ID : '+ imageId);
        serviceImage.updateImagePostTitle(imageId, newTitle, function callback(err, image) {
            if(err){
                logger.prettyError(err);
                return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
            }
            return res.status(statusCodes.NO_CONTENT).send();
        })
    },

    handleUploadGif: function (req, res) {

        upload.single('fileToUpload')(req, res, function (err) {
            if (err) {
                logger.prettyError(err);
                return apiErrors.UNPROCESSABLE_ENTITY.new('Error during processing file upload.').sendWith(res);
            }

            var imgID = req.file.filename.substr(0, req.file.filename.lastIndexOf('.'));
            serviceImage.saveGifToDataBase(imgID, function (err, newImage) {
                if(err){
                    logger.prettyError(err);
                    return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
                }
                logger.info(`Image ${imgID} uploaded successfully and saved to database`);
                res.redirect(newImage.short_link);

                serviceS3Upload.queueGifForS3Upload(newImage._id, function callback(err, image){
                    if(err){
                        logger.prettyError(err);
                        logger.error(`Failed to move image ${newImage._id} moved to S3`);
                    }

                    logger.info(`Image ${image_id} moved to S3`);
                    serviceUtils.precacheURLToFacebook(image.short_link);

                });

            });

        });
    },
    
    handleDeleteImage: function(req, res){
        var image_id = req.body.image_id;
        //check body

        //remove in local
        serviceImage.deleteImageWithId(image_id, function deleteCallback(err) {
            if(err){
                logger.prettyError(err);
                return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
            }else{
                return res.status(statusCodes.NO_CONTENT).send();
            }
        });
        //TODO remove in server s3
    },


};

module.exports = image;


