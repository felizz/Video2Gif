/**
 * Created by kyle on 28/5/16.
 */

var fs = require('fs');
var convertToGif = require('./gif-convert');
var logger = require('utils/logger');
const exec = require('child_process').exec;

module.exports = {
    addWatermarkToGifImage: function (inputGif, outputGif, callback) {

        var addWatermarkCommand = `convert ${inputGif} -coalesce -gravity southeast -geometry +10+7 null: public/assets/watermark.png -layers composite -layers optimize ${outputGif}`;
        exec(addWatermarkCommand, (err, stdout, stderr) => {
            if (err) {
                logger.debug('Command execution failed : ' + addWatermarkCommand);
                return callback(err);
            }
            logger.debug('Command executed : ' + addWatermarkCommand);
            return callback(null);
        });
    },

    optimizeGif: function (inputGif, outputGif, callback){
        var optimizeCommand = `gifsicle -O3 ${inputGif} -o ${outputGif}`;
        exec(optimizeCommand, (err, stdout, stderr) => {
            if (err) {
                logger.debug('Command execution failed : ' + optimizeCommand);
                return callback(err);
            }
            logger.debug('Command executed : ' + optimizeCommand);
            return callback(null);
        });
    },

    saveRemoteStreamAsLocalGif: function (remoteVideoSource, localFile, startTime, duration, subtitle, onProgress, callback) {

        var gif = fs.createWriteStream(localFile);

        var options = {
            resize: '480:-1',
            from: startTime,
            duration: duration,
            colors: 256,
            text: subtitle
            //subtitles: path.join(__dirname, 'movie.ass')
        };

        convertToGif(remoteVideoSource, options, onProgress).pipe(gif);

        gif.on('close', function end() {
            logger.debug('Converted  ' + remoteVideoSource + ' to ' + localFile);
            return callback(null);
        });
    }
};