var express = require('express');
var router = express.Router();
var passport = require('passport');
var userController = require('../controllers/user');
var authMid = require('../controllers/middleware/auth');

router.get('/trang-ca-nhan', function (req, res) {
    return res.send("user: name:"+req.user.fb.name+"; id: "+req.user.fb.id);
});

router.get('/login', userController.handleUserLogin);

router.get('/logout', userController.handleLogout);

router.get('/login/facebook/callback', userController.handleloginFbCallback, userController.handlePostLogin);

module.exports = router;