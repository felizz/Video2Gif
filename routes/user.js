var express = require('express');
var router = express.Router();
var user = require('../controllers/user');

module.exports = function (passport) {
    router.get('/callback', function (req,res) {
        passport.authenticate('facebook', {
            successRedirect : '/user/trang-ca-nhan',
            failureRedirect : '/'
        })
    });

    router.get('/trang-ca-nhan', function (req, res) {
        return res.send("OK");
    });

    /* Post Signup User. */
    router.post('/signup', function (req, res, next) {
        user.handleUserSignUp(req, res);
    });
    return router;
};


