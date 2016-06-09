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
var CACHING_TTL = 20; //seconds
var serviceGif = require('./gif');
var score = require('utils/score');
var easyimage = require('easyimage');

var setCacheValue = function (imageId, value){
    if(!value){
        return adCache.set(imageId, null, CACHING_TTL);
    }

    adCache.get(imageId, function( err, percentCompleted ){
        if(err){
            return ;
        }

        adCache.set(imageId, Math.max(percentCompleted, value), CACHING_TTL);
    });
};

var generateRandomIntegerBetween = function (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
};

var serviceImage = {
    getImageById: function (imageId, callback){
        Image.findById(imageId, function (err, image) {
            if (err) {
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }
            return callback(null, image);
        });
    },

    updateViewCountAndScore: function (viewCount, image){
        image.view_count = viewCount;
        image.hot_score = score.caculateHotScore(image);
        image.save();
        logger.debug(`Image ${image._id} updated views = ${image.view_count}, hot_score = ${image.hot_score}`);
    },

    processLoveForImageById: function (imageId, loveVal, callback) {
        Image.findById(imageId, function (err, image) {
            if (err) {
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }
            if(loveVal==0){
                image.love_count--;
                logger.info(`successfully  -1 love was for image: ${imageId}`);
            }else{
                image.love_count++;
                logger.info(`successfully +1 love  was for image: ${imageId}`);
            }
            image.save();
            return callback(null, image);
        });
    },

    extractGifFromVideo: function (videoUrl, imageId, startTime, duration, callback) {
        adCache.set(imageId, generateRandomIntegerBetween(1,5), CACHING_TTL);

        logger.info('Start Youtube dl getInfo. URL = ' + videoUrl);
        youtubedl.getInfo(videoUrl, function(err, info) {
            if (err){
                logger.prettyError(err);
                return callback(new UnprocessableError('Unable to retrieve video info : URL = ' + videoUrl));
            }

            logger.info('Info successfully retrieved for URL. Title : ' + info.title);
            var fileName = imageId + '.gif';

            //Gif Extraction in Progress
            serviceGif.saveRemoteStreamAsLocalGif(info.url, GIF_DIR + fileName, startTime, duration,
                function onProgress(err, percentProgress){
                    if(err){
                        setCacheValue(imageId, null);
                    }
                    else {
                        setCacheValue(imageId, percentProgress);
                    }
                },
                function saveGifCallback(err) {

                var newImage = new Image({
                    _id: imageId,
                    name: fileName,
                    title: info.title,
                    direct_url: '/images/' + fileName,
                    source_video: videoUrl,
                    short_link: SHORT_LINK_DOMAIN + imageId
                });

                newImage.save(function (err) {
                    if (err) {
                        logger.prettyError(err);
                        return;
                    }

                    logger.info('Gif successfully saved to database : ' + fileName);
                    setCacheValue(imageId, 95);
                    serviceImage.updateViewCountAndScore(0, newImage);

                    setTimeout(function () {
                        //Wait 2 seconds before returning result as the file is not yet saved.
                        setCacheValue(imageId, 100);
                    }, 2000);

                    return callback(null, newImage);
                });

                logger.info('Gif successfully saved to file : ' + fileName);
            });

            logger.info('Gif Conversion successfully started!');
            setCacheValue(imageId, generateRandomIntegerBetween(5,15));

        });
    },
    saveGifToDataBase: function (imgID, callback) {
        var filename = imgID+".gif";
        var newImage = new Image({
            _id: imgID,
            name: filename,
            title: imgID,
            direct_url: '/images/' + filename,
            short_link: SHORT_LINK_DOMAIN + imgID
        });

        newImage.save(function (err) {
            if (err) {
                logger.prettyError(err);
                return;
            }

            logger.info('Gif successfully saved to database : ' + filename);
            return callback(null, newImage);
        });
    },

    getPercentOfProgress: function (imageId, callback) {
        adCache.get(imageId, function( err, percentCompleted ){
            if(err || !percentCompleted){
                return callback(new SNError('No Caching record found for image id ' + imageId));
            }

            if(percentCompleted < 96){
                setCacheValue(imageId, percentCompleted + Math.random()*3.0);
            }

            return callback(null, percentCompleted);
        });
    },

    getNewImages: function (limit, offset, callback) {
        Image.getImagesByNew(limit, offset, function (err, result) {
            return callback(err, result);
        })
    },

    getHotImages: function (limit, offset, callback) {
        Image.getImagesByHot(limit, offset, function (err, result) {
            return callback(err, result);
        })
    },

    updateImagePostTitle: function (imageId, newTitle, callback) {
        Image.findById(imageId, function (err, image) {
            if (err) {
                logger.prettyError(err);
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }
            image.title = newTitle;
            image.save();
            return callback(null, image);
        });
    },

    updateImageDimension: function(imageId){

        serviceImage.getImageById(imageId, function getImageCallback(err, image){

            if(err){
                logger.prettyError(err);
            }
            else if(image){
                easyimage.info(GIF_DIR + image.name).then(
                    function (imageInfo) {
                        image.width = imageInfo.width;
                        image.height = imageInfo.height;
                        image.save(function (err){
                           logger.info(`Image ${imageId} updated with width = ${image.width}, height = ${image.height}`);
                        });

                    }, function (err) {
                        logger.error('Failed to retrieve image info : ' + GIF_DIR + image.name)
                        logger.prettyError(err);
                    });
            }
        });
    }
    
};

module.exports = serviceImage;
