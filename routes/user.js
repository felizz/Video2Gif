var express = require('express');
var router = express.Router();
var user = require('../controllers/user')

/* Post Signup User. */
router.post('/signup', function (req, res, next) {
    user.handleUserSignUp(req, res);
});

module.exports = router;
