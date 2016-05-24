
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('utils/logger');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('utils/config');

try{
var routes = require('./routes/index');
var user = require('./routes/user');
var image = require('./routes/image');
var app = express();

require('./config/database-connect');
app.locals.MEDIA_ENDPOINT = config.AWS.web_endpoint;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(require('morgan')('combined', {"stream": logger.stream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('styleguide'));

app.use('/', routes);
app.use('/user', user);
app.use('/api/v1/image', image);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
}
catch (err){
    logger.prettyError(err);
}

module.exports = app;
