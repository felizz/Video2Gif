var express = require('express');
var router = express.Router();
var passport = require('passport');
var userController = require('../controllers/user');

router.get('/trang-ca-nhan', function (req, res) {
    return res.send("user: name:"+req.user.fb.name+"; id: "+req.user.fb.id);
});

router.get('/login', userController.handleUserLogin);

router.get('/login/facebook/callback',userController.handleloginFbCallback);

/* Post Signup User. */
router.post('/signup', function (req, res, next) {
    userController.handleUserSignUp(req, res);
});

module.exports = router;