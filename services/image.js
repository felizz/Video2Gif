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
var RecordNotFound = require('infra/errors/record-not-found-error');
var NodeCache = require('node-cache');
var myCache = new NodeCache();

module.exports = {
    getImageById: function (imageId, callback){
        Image.findById(imageId, function (err, image) {
            if (err) {
                return callback(new DatabaseError(`Image Id ${imageId} not found in database`));
            }

            return callback(null, image);
        });
    },

    extractGifFromVideo: function (video_url, imageId, startTime, duration, callback) {
        youtubedl.getInfo(video_url, function(err, info) {
            if (err){
                logger.prettyError(err);
                return callback(new UnprocessableError('Unable to retrieve video info : URL = ' + video_url));
            }


            logger.info('Info successfully retrieved for URL. Title : ' + info.title);

            
            var fileName = imageId + '.gif';

            ffmpeg(info.url).noAudio().seekInput(startTime)
                .outputFormat('gif').duration(duration).size('640x?')
                .on('start', function (commandLine) {
                    logger.info('Transcoding process started. Filename : ' + fileName);
                    logger.info('Duration: '+ duration + " second");
                    //logger.info('command line: '+commandLine);
                    myCache.set(imageId,'0:0:0.0');
                    //return callback(null,imageId);
                    //return res.status(statusCodes.OK).send(imageId);
                })
                .on('error', function (err, stdout, stderr) {
                    logger.info('Cannot process video: ' + err.message);
                })
                .on('progress', function (progress) {
                    logger.info('process in : ' + progress.timemark + 'second ' + imageId );
                    //myCache.set(fileName,progress.timemark,10000);

                    myCache.set(imageId, progress.timemark, function( err, success ){
                        if(err){
                            console.log("err to cache file" +err);
                        }
                        else
                        {
                            value = myCache.get(imageId);
                            console.log("da cache: "+ value);
                        }
                    });
                })
                .on('end', function () {
                    if (err) {
                        logger.prettyError(err);
                        return apiErrors.UNPROCESSABLE_ENTITY.new().sendWith(res);
                    }

                    var newImage = new Image({
                        _id: imageId,
                        name: fileName,
                        direct_url: '/images/' + fileName,
                        source_video: video_url,
                        short_link: SHORT_LINK_DOMAIN + imageId
                    });
                    newImage.save(function (err){
                        if(err){
                            logger.prettyError(err);
                            return callback(new DatabaseError('Error saving image Id ' + imageId));
                        }

                        logger.info('Gif successfully saved to file : ' + fileName);
                        return callback(null, newImage);
                    });
                    //myCache.del(imageId);
                    //close route /poll/filename
                    logger.info('Gif successfully saved to file : ' + fileName);
                   // myCache.set(imageId, duration);
                    //return res.status(statusCodes.OK).send({url: '/gifs/' + fileName, image_id: imageId});
                })
                .save(GIF_DIR + fileName);
        });
    },
    getPercentOfProgress: function (imageId, duration, callback) {
        myCache.get(imageId, function( err, value ){
            if( !err ){
                if(value == undefined){
                    // key not found
                    //return res.send("99");
                    callback(new RecordNotFound('Progress of image undefined'));
                }else{
                    console.log("tim duoc gia tri: " + value );
                    var d = value.split(':');
                    var durSecond =  (+d[0]) * 60 * 60 + (+d[1]) * 60 + (+d[2]);
                    var percent = Math.floor(durSecond/(+duration)*100);
                    console.log("percent: "+percent);
                    return callback(null, percent.toString());
                    
                }
            }
        });
    }
};