/**
 * Created by kyle on 19/5/16.
 */


'use strict';
var RemoteServiceError = require('infra/errors/remote-service-error');
var logger = require('utils/logger');
var knox = require('knox');
var config = require('utils/config');

var client = knox.createClient({
    key: config.AWS.api_key,
    secret: config.AWS.api_secret,
    bucket: config.AWS.s3_bucket
});


module.exports = {
    uploadFileToS3: function (localFilePath, remoteFilePath, callback){

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
    }
};