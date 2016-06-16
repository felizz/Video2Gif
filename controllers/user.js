/**
 * Created by kyle on 28/12/15.
 */

var service_user = require('../services/user');
var logger = require('utils/logger');
var validator = require('utils/validator');
var passport = require('passport');

var user = {
    handleUserSignUp: function (req, res) {
        //Request Validation
        if(!validator.isEmail(req.body.email)){
            return res.status(400).json(returnCode.INPUT_PARAMETERS_INVALID);
        }

        //Service Orchestration
        service_user.signup(req.body.email, function signupCallback(err){
            if(err){
                return res.status(500).json(returnCode.INTERNAL_SERVER_ERROR);
            }

            return res.status(200).json(returnCode.REQUEST_SUCCESS);
        });
    },
    handleLogout: function (req, res) {
        //req.user = null;
        req.logout();
        res.redirect('/');
    },

    renderSignUpPage: function (req, res) {
        return res.render('signup/index', { pageTitle: "Đăng ký tài khoản", pageName: 'signup-page signin-page', pageJs: ['/js/signup.js']});
    },
    
    /*
    handleUserLogin: passport.authenticate('facebook',{ scope : 'email' }),


    handleloginFbCallback: passport.authenticate('facebook', {
        successRedirect : '/',
        failureRedirect : '/'
    })
    */
    handleUserLogin: function (req, res, next) {
        passport.authenticate(
            'facebook',
            {
                callbackURL: 'http://localhost:6767/user/login/facebook/callback'
            }
        )(req, res, next);
    },

    handleloginFbCallback: function (req, res, next) {
        passport.authenticate(
            'facebook',
            {
                callbackURL: 'http://localhost:6767/user/login/facebook/callback',
                successRedirect:'/',
                failureRedirect:'/'
            }
        )(req,res,next);
    }

};


module.exports = user;


