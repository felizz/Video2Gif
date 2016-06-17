
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

    var isAuthenticated = function (req, res, next) {
        // if user is authenticated in the session, call the next() to call the next request handler
        // Passport adds this method to request object. A middleware is allowed to add properties to
        // request and response objects
        if (req.isAuthenticated())
            return next();
        // if the user is not authenticated then redirect him to the login page
        res.redirect('/');
    };


    
app.use(require('morgan')('combined', {"stream": logger.stream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('styleguide'));
app.locals.renderingUtils = require('./views/renderingUtils');


// Configuring Passport
var passport = require('passport');
var session = require('express-session');
app.use(session({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);


app.use('/', routes);
app.use('/user', user);
app.use('/api/v1/image', image);

    //fixing 304
app.disable('etag');

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
