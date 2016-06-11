/**
 * Created by kyle on 1/6/16.
 */


'use strict';
var request = require('request');
var fs = require('fs');
var async = require('async');
var logger = require('utils/logger');
var knox = require('knox');
var config = require('utils/config');
var SNError = require('infra/errors/sn-error');
const exec = require('child_process').exec;

var client = knox.createClient({
    key: config.AWS.api_key,
    secret: config.AWS.api_secret,
    bucket: config.AWS.s3_bucket,
    region: "ap-southeast-1",
    style: "path"
});

module.exports = {
    uploadFileToS3: function (localFilePath, remoteFilePath, callback){

        fs.stat(localFilePath, function statCallback(err, stats) {
            if (err || !stats.isFile()) {
                logger.info(`Local  file ${localFilePath} does not exist for upload to S3`);
                return callback(new SNError(`Local Image file ${localFilePath} does not exist for upload to S3`));
            }

            client.putFile(localFilePath , remoteFilePath,function(err, res){

                if(err){
                    logger.prettyError(err);
                    return callback(new SNError(`Error putting file ${localFilePath} to S3 ${remoteFilePath}`));
                }

                if(res.statusCode === 200){
                    logger.debug(`Successfuly put file ${localFilePath} to S3 dir ${remoteFilePath} `);
                    return callback(null);
                }
                else {
                    return callback(new SNError(`Error putting file ${localFilePath} to S3. Response code = ` + res.statusCode));
                }
            });
        });
    },

    getFileFromS3: function (remoteFilePath, localFilePath, callback){

        fs.stat(localFilePath, function statCallback(err, stats) {
            if (!err) {
                logger.info(`Local file ${localFilePath} already existed`);
                return callback(new SNError(`Local Image file ${localFilePath} already existed`));
            }

            client.getFile(remoteFilePath, function(err, res){
                if(err){
                    logger.info('Error geting file from S3: ' + remoteFilePath);
                    return callback(err);
                }

                var fileStream = fs.createWriteStream(localFilePath);
                res.on('data', function (chunk) {
                    fileStream.write(chunk);
                });
                res.on('end', function () {
                    fileStream.end();
                    logger.debug('Saved  ' + remoteFilePath + ' from S3 to ' + localFilePath);
                    return callback(null);
                });
            });
        });
    },

    execCommand(command, callback){
        exec(command, (err, stdout, stderr) => {
            logger.debug('Executing command : ' + command);
            return callback(err, stdout);
        });
    }
};