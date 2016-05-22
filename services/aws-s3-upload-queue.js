/**
 * Created by kyle on 19/5/16.
 */


'use strict';
var logger = require('utils/logger');
var knox = require('knox');
var config = require('utils/config');
var S3_GIF_PATH = '/ad-images/';
var GIF_DIR = 'public/images/';
var Image = require('../models/image');
var DatabaseError = require('infra/errors/database-error');
var SNError = require('infra/errors/sn-error');
var fs = require('fs');

var client = knox.createClient({
    key: config.AWS.api_key,
    secret: config.AWS.api_secret,
    bucket: config.AWS.s3_bucket
});

var  uploadFileToS3 = function (localFilePath, remoteFilePath, callback){

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
    });
};

module.exports = {
    queueGifForS3Upload: function(imageId,  callback){

        Image.findById(imageId, function (err, image){
            if(err) {
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }

            var imageFile = GIF_DIR + image.name;
            fs.stat(imageFile, function (err, stats){
                if(err || !stats.isFile()) {
                    return callback(new SNError(`Image  ${image.name} not found on disk`));
                }

                logger.info(`Start upload file ${imageFile} to S3 ${S3_GIF_PATH}` );
                uploadFileToS3(imageFile, S3_GIF_PATH + image.name, function s3UploadCallback(err){
                    if(err){
                        return callback(err);
                    }

                    image.direct_url = config.AWS.web_endpoint + S3_GIF_PATH + image.name;
                    image.save(function (err){
                        if(err){
                            return callback(new DatabaseError(`Unable to save Image Id ${imageId} to database`));
                        }

                        fs.unlink(imageFile);
                        return callback(null, image);
                    });
                });
            });
        });
    }
};