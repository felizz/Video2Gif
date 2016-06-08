/**
 * Created by kyle on 25/5/16.
 */
var Image = require('../../models/image');
require('../../config/database-connect');
var logger = require('utils/logger');
var score = require('utils/score');

logger.info('Start updating database. the first 1000 images');


Image.find()
    .exec(
        function (error, images) {
            if (error) {
                return callback(error);
            }
            logger.info(`Updating ${images.length} images`);
            var numImageProcessed = 0;
            images.forEach(function (image) {
                if(!image.view_count){
                    image.view_count = 0;
                }
                image.hot_score = score.caculateHotScore(image);
                image.save(function (err){
                    numImageProcessed++;
                    logger.info(`${numImageProcessed}. Image ${image._id} updated hot_score = ${image.hot_score}`);

                    if(numImageProcessed >= images.length){
                        logger.info('Database update finished.');
                        process.exit();
                    }
                });
            });
        }
    );

