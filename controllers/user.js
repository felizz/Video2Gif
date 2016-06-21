/**
 * Created by kyle on 28/12/15.
 */

var serviceUser = require('../services/user');
var serviceImage = require('../services/image');
var passport = require('passport');
var config = require('utils/config');
var shortid = require('shortid');
var errReason = require('infra/error-reason');
var apiErrors = require('infra/api-errors');
var logger = require('utils/logger');
var validator = require('utils/validator');

var user = {

    handleLogout: function (req, res) {
        //req.user = null;
        req.logout();
        res.redirect('/');
    },

    renderSignUpPage: function (req, res) {
        return res.render('signup/index', { pageTitle: "Đăng ký tài khoản", pageName: 'signup-page signin-page', pageJs: ['/js/signup.js']});
    },

    handleUserLogin: function (req, res, next) {

        var callbackURL = config.web_prefix + '/user/login/facebook/callback';

        if(req.query.claim_image !== undefined && req.query.claim_image !== null  && shortid.isValid(req.query.claim_image)){
            callbackURL = callbackURL + '?claim_image=' + req.query.claim_image;
        }

        passport.authenticate(
            'facebook',
            {
                callbackURL: callbackURL,
                scope: [ 'email' ]
            }
        )(req, res, next);
    },

    handleloginFbCallback: function (req, res, next) {

        var callbackURL = config.web_prefix + '/user/login/facebook/callback';

        if(req.query.claim_image !== undefined && req.query.claim_image !== null  && shortid.isValid(req.query.claim_image)){
            callbackURL = callbackURL + '?claim_image=' + req.query.claim_image;
        }

        logger.debug('Facebook callback executing...');
        passport.authenticate(
            'facebook',
            {
                callbackURL: callbackURL,
                scope: [ 'email' ]
            }
        )(req,res,next);
    },

    handlePostLogin : function (req, res){

        if(req.query.claim_image !== undefined && req.query.claim_image !== null  && shortid.isValid(req.query.claim_image)){
            serviceImage.updateOwnerId(req.query.claim_image, req.user._id, function updateOwnerIdCallback(err, image ) {

                if(err){
                    logger.prettyError(err);
                    if(err instanceof AlreadyExistedError){
                        return apiErrors.ALREADY_EXIST.new().sendWith(res);
                    }
                }

                logger.info(`Post Login : User ${req.user._id} claimed image ${image._id}`);
                return res.redirect('/' + image._id);
            } );
        }
        else {
            return res.redirect('/');
        }
    }
};


module.exports = user;


