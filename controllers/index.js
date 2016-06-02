/**
 * Created by kyle on 18/5/16.
 */
var shortid = require('shortid');
var serviceImage = require('../services/image');
var logger = require('utils/logger');
var validator = require('utils/validator');
var statusCodes = require('infra/status-codes');
var errReason = require('infra/error-reason');
var apiErrors = require('infra/api-errors');
var DEFAULT_POST_PER_LOAD = 4;

module.exports = {
    renderHomePage: function (req, res) {
        var randomOffset = Math.floor(Math.random() * 31);
        serviceImage.getNewImages(DEFAULT_POST_PER_LOAD,0,function (err, newImages) {
            serviceImage.getHotImages(DEFAULT_POST_PER_LOAD, randomOffset,function (err, hotImages) {
                res.render('home',{
                    newImages: newImages,
                    hotImages: hotImages
                });
            });
        });
    },

    renderCreatePage: function (req, res){
        res.render('create-gif');
    },

    renderGifPage: function (req, res){
        var imageId = req.params.gif_name;
        if(!shortid.isValid(imageId)){
            return apiErrors.RESOURCE_NOT_FOUND.new().sendWith(res);
        }
        serviceImage.getImageById(imageId, function getImageCallback(err, image) {
            if (err) {
                return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
            }

            if(!image){
                return apiErrors.RESOURCE_NOT_FOUND.new().sendWith(res);
            }

            console.log(image);
            return res.render('image-view', {image : image});
        });
    },

    handleLoadmoreImage: function (req, res) {
        var limit = req.query.limit;
        var offset = req.query.offset;

        if(!limit || !validator.isNumeric(limit)){
            limit = DEFAULT_POST_PER_LOAD;
        }
        else {
            limit = parseInt(limit);
        }

        if(!offset || !validator.isNumeric(offset)){
            return apiErrors.INVALID_PARAMETERS.new('Offset must be present and numeric!').sendWith(res);
        }

        offset = parseInt(offset);

        logger.debug(`Handle Loadmore. Limit = ${limit}, offset = ${offset}`);
        serviceImage.getNewImages(limit, offset, function (err, images) {
            if(err){
                logger.prettyError(err);
                return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
            }

            logger.info('Handle Loadmore successfully.');
            return res.render('imageItem',{newImages: images});
        });
    }
};