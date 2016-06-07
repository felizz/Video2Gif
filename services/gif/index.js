/**
 * Created by kyle on 28/5/16.
 */

var fs = require('fs');
var convertToGif = require('./gif-convert');
var logger = require('utils/logger');



module.exports = {
  saveRemoteStreamAsLocalGif: function (remoteVideoSource, localFile, startTime, duration, onProgress, callback) {

      var gif = fs.createWriteStream(localFile);

      var options = {
          resize: '480:-1',
          from: startTime,
          duration:  duration,
          colors: 256,
          //compress: 100,
          text: "anhdong.vn"
          //subtitles: path.join(__dirname, 'movie.ass')
      };

      convertToGif(remoteVideoSource, options, onProgress).pipe(gif);

      gif.on('close', function end() {
          logger.debug('Converted  ' + remoteVideoSource + ' to ' + localFile);
          return callback(null);
      });
  }
};