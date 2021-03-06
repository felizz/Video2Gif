/**
 * Created by kyle on 18/5/16.
 */
var shortid = require('shortid');
var serviceImage = require('../services/image');
var serviceUser = require('../services/user');
var logger = require('utils/logger');
var validator = require('utils/validator');
var statusCodes = require('infra/status-codes');
var errReason = require('infra/error-reason');
var apiErrors = require('infra/api-errors');
var DEFAULT_POST_PER_LOAD = 4;
var passport = require('passport');
var config = require('utils/config');

module.exports = {
    renderHomePage: function (req, res) {
        return res.render('home',{req: req});
    },

    renderCreatePage: function (req, res){
        return res.render('create-gif',{req: req});
    },

    renderGifPage: function (req, res){
        var imageId = req.params.gif_name;
        console.log(req.useragent.isBot);
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
            if(!req.useragent.isBot){
                serviceImage.updateViewCountAndScore(image.view_count + 1, image);
            }

            var urlEncode = encodeURIComponent(image.short_link);
            return res.render('image-view', {image : image,req: req, urlEncode: urlEncode});
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
        serviceImage.getHotImages(limit, offset, function (err, images) {
            if(err){
                logger.prettyError(err);
                return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
            }

            logger.info('Handle Loadmore successfully.');
            return res.render('imageItem',{newImages: images});
        });
    },
    
    loginWithFacebook: function () {
        passport.authenticate('login', {
            successRedirect: '/',
            failureRedirect: '/tao-anh',
            failureFlash : true
        })

    }
};