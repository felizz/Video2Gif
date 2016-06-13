var express = require('express');
var router = express.Router();
var user = require('../controllers/user');


router.get('/trang-ca-nhan', function (req,res) {
   res.send('OK');
});

/* Post Signup User. */
router.post('/signup', function (req, res, next) {
    user.handleUserSignUp(req, res);
});

module.exports = router;
