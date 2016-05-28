/**
 * Created by kyle on 28/5/16.
 */

var fs = require('fs');
var convertToGif = require('./gif-convert');
var path = require('path');
var logger = require('utils/logger');



module.exports = {
  saveRemoteStreamAsLocalGif: function (remoteVideoSource, localFile, startTime, duration, callback) {

      var gif = fs.createWriteStream(localFile);

      var options = {
          resize: '480:-1',
          from: startTime,
          to: startTime + duration
          //subtitles: path.join(__dirname, 'movie.ass')
      };

      convertToGif(remoteVideoSource, options).pipe(gif);

      gif.on('close', function end() {
          logger.debug('Converted  ' + remoteVideoSource + ' to ' + output);
          return callback(null);
      });
  }
};