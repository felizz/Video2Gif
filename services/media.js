/**
 * Created by kyle on 19/5/16.
 */


'use strict';
var logger = require('utils/logger');
var knox = require('knox');
var config = require('utils/config');
var S3_GIF_PATH = 'ad-images/';
var GIF_DIR = 'public/images/';
var Image = require('../models/image');
var DatabaseError = require('infra/errors/database-error');
var SNError = require('infra/errors/sn-error');
var fs = require('fs');
var gifService = require('./gif');
var TMP_DIR = '/tmp/anhdong/';
var client = knox.createClient({
    key: config.AWS.api_key,
    secret: config.AWS.api_secret,
    bucket: config.AWS.s3_bucket,
    region: "ap-southeast-1",
    style: "path"
});

fs.access(TMP_DIR, fs.F_OK, function (err){
    if(err){
        fs.mkdir(TMP_DIR);
    }
});

var uploadFileToS3 = function (localFilePath, remoteFilePath, callback){

    client.putFile(localFilePath , remoteFilePath, { 'x-amz-acl': 'public-read' },function(err, res){

        if(err){
            logger.prettyError(err);
            return callback(new RemoteServiceError(`Error putting file ${localFilePath} to S3 ${remoteFilePath}`));
        }

        if(res.statusCode === 200){
            logger.debug(`Successfuly put file ${localFilePath} to S3 dir ${remoteFilePath} `);
            return callback(null);
        }
        else {
            return callback(new RemoteServiceError(`Error putting file ${localFilePath} to S3. Response code = ` + res.statusCode));
        }
    })
};


module.exports = {

    postImageProcessing: function(imageId, callback){

        Image.findById(imageId, function (err, image){
            if(err) {
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }

            logger.info(`Image ${imageId} post-processing started`);

            var imageFile = GIF_DIR + image.name;
            fs.access(imageFile, fs.R_OK, function (err){
                if(err) {
                    return callback(new SNError(`Image  ${image.name} not accessible`));
                }

                //Add watermark to the Gif image
                var watermarkedGif = TMP_DIR + image._id + '_watermarked.gif';
                gifService.addWatermarkToGifImage(imageFile, watermarkedGif, function addWatermarkCallback(err){
                   if(err){
                       logger.info('Add watermark to Gif failed. Image id :' + image._id);
                       return callback(err);
                   }

                    logger.info('Add watermark to Gif succeeded. Image id :' + image._id);
                    //Optimize Gif Image
                    var optimizedGif = TMP_DIR + image.name;
                    gifService.optimizeGif(watermarkedGif, optimizedGif, function optimzeCallback(err){
                        if(err){
                            logger.info('Optimize Gif failed. Image id :' + image._id);
                            return callback(err);
                        }

                        logger.info('Optimize Gif succeeded. Image id :' + image._id);

                        //Upload optimized watermated gif to S3
                        logger.info(`Start upload file ${optimizedGif} to S3 ${S3_GIF_PATH}` );
                        uploadFileToS3(optimizedGif , S3_GIF_PATH + image.name, function s3UploadCallback(err){
                            if(err){
                                logger.info(`S3 upload ${optimizedGif} failed!`);
                                return callback(err);
                            }

                            //Update image direct url in database
                            image.direct_url = config.AWS.web_endpoint + S3_GIF_PATH + image.name;
                            image.save(function (err){
                                if(err){
                                    return callback(new DatabaseError(`Unable to save Image Id ${imageId} to database`));
                                }

                                fs.unlink(imageFile);
                                fs.unlink(watermarkedGif);
                                fs.unlink(optimizedGif);
                                return callback(null, image);
                            });
                        });
                    });
                });
            });
        });
    }
};