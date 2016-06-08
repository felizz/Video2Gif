/**
 * Created by kyle on 25/5/16.
 */
var Image = require('../../models/image');
require('../../config/database-connect');
var logger = require('utils/logger');
var score = require('utils/score');

logger.info('Start updating database. the first 1000 images');


Image.find()
    .limit(1000)
    .exec(
        function (error, images) {
            if (error) {
                return callback(error);
            }

            for(var i=0; i< images.length; i++){
                var image = images[i];
                image.hot_score = score.caculateHotScore(image);
                image.save();
                logger.info(`Image ${image._id} updated hot_score = ${image.hot_score}`);
            }

            logger.info('Database update finished.');
            process.exit();
        }
    );

