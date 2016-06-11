/**
 * Created by kyle on 28/5/16.
 */
var duration = require('moment').duration;
var spawn = require('child_process').spawn;

require('moment-duration-format');

var logger = require('utils/logger');

var generateRandomIntegerBetween = function (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
};

module.exports = gifify;

function gifify(streamOrFile, opts, onProgress) {
    if (typeof streamOrFile === 'string') {
        opts.inputFilePath = streamOrFile;
    }

    if (opts.fps === undefined) {
        opts.fps = 10;
    }

    if (opts.speed === undefined) {
        opts.speed = 1;
    }

    if (opts.colors === undefined) {
        opts.colors = 80;
    }

    if (opts.from !== undefined && typeof opts.from === 'number' ||
        typeof opts.from === 'string' && opts.from.indexOf(':') === -1) {
        opts.from = parseFloat(opts.from) * 1000;
    }

    if (opts.duration !== undefined && typeof opts.duration === 'number' ||
        typeof opts.duration === 'string' && opts.duration.indexOf(':') === -1) {
        opts.duration = parseFloat(opts.duration) * 1000;
    }

    var ffmpegArgs = computeFFmpegArgs(opts);
    var convertArgs = computeConvertArgs(opts);
    var gifsicleArgs = computeGifsicleArgs(opts);

    var ffmpeg = spawn('ffmpeg', ffmpegArgs);
    var convert = spawn('convert', convertArgs);
    var gifsicle = spawn('gifsicle', gifsicleArgs);

    convert.stdin.on('close', function (){
        //temporarily faking progress
        onProgress(null, generateRandomIntegerBetween(25, 50));
    });

    gifsicle.stdin.on('close', function (){
        //temporarily faking progress
        onProgress(null, generateRandomIntegerBetween(65, 85));
    });

    [ffmpeg, convert, gifsicle].forEach(function handleErrors(child) {
        child.on('error', function (err){
           logger.info('Facing err converting gif');
            logger.prettyError(err);
        });
        //child.on('error', gifsicle.emit.bind(gifsicle, 'error'));
        //child.stderr.on('data', function gotSomeErrors(buf) {
        //    logger.info('Gif convert error: ');
        //
        //    // emit errors on the resolved stream
        //    gifsicle.stdout.emit('error', buf.toString());
        //});
    });

    // https://github.com/joyent/node/issues/8652
    ffmpeg.stdin.on('error', function ignoreStdinError(){});

    // ffmpeg.stdout.on('error', function() {})
    // convert.stdin.on('error', function(){});
    // convert.stdout.on('error', function() {});
    // gifsicle.stdin.on('error', function() {});
    // gifsicle.stdout.on('error', function() {})

    if (!opts.inputFilePath) {
        streamOrFile.pipe(ffmpeg.stdin);
    }

    ffmpeg.stdout.pipe(convert.stdin);
    convert.stdout.pipe(gifsicle.stdin);
    return gifsicle.stdout;
}

function computeFFmpegArgs(opts) {
    var FFmpegTimeFormat = 'hh:mm:ss.SSS';

    // FFmpeg options
    // https://www.ffmpeg.org/ffmpeg.html#Options
    var args = [
        '-loglevel', 'panic'
    ];

    // fast seek to opts.from - 500ms
    // see http://superuser.com/a/704118/35651
    if (opts.from !== undefined) {
        args.push('-ss', duration(opts.from).format(FFmpegTimeFormat, {trim: false}));
    }

    if (opts.inputFilePath) {
        args.push('-i', opts.inputFilePath);
    } else {
        // stdin as input
        // https://www.ffmpeg.org/ffmpeg-protocols.html#pipe
        args.push('-i', 'pipe:0');
    }

    if (opts.duration !== undefined) {
        args.push('-t', duration(opts.duration).format(FFmpegTimeFormat, {trim: false}));
    }

    // framerate
    args.push('-r', opts.fps);

    if (opts.resize || opts.subtitles) {
        // filters
        args.push('-vf');

        var filters = [];
        // resize filter
        if (opts.resize) {
            filters.push('scale=' + opts.resize);
        }

        if (opts.subtitles !== undefined) {
            filters.push('subtitles=' + opts.subtitles);
        }

        args.push(filters.join(','));
    }

    // encoding filter and codec
    args.push('-f', 'image2pipe', '-vcodec', 'ppm');

    // force video sync so that even if nothing moves in the video, we get a constant frame rate
    // seems buggy, not what I want, still, some videos are failing to encode
    // args.push('-vsync', '1');

    // write on stdout
    args.push('pipe:1');

    logger.debug('ffmpeg args: ' + args.join(" "));

    return args;
}

function computeConvertArgs(opts) {
    // Convert options
    // http://www.imagemagick.rg/script/convert.php#options
    var args = [
        '-',
        '+dither',
        '-layers', 'Optimize'
    ];

    if (opts.text) {
        args.push(
            '-gravity', 'South',
            '-fill', 'white',
            '-stroke', 'white',
            '-strokewidth', '0',
            '-pointsize', '15',
            '-annotate', '+180+10', opts.text
        );
    }

    args.push('gif:-');

    logger.debug('convert args: ' + args.join(" "));

    return args;
}

function computeGifsicleArgs(opts) {
    // Gifsicle options
    // http://www.lcdf.org/gifsicle/man.html
    var args = [
        '-O1',
        '--colors=' + opts.colors,
        '--delay', Math.round(100 / opts.fps / opts.speed),
        '--no-warnings'
    ];

    logger.debug('gifsicle args: ' + args.join(" "));

    return args;
}