var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', {title: 'Express'});
});
router.get('/:gif_name', function(req, res, next) {
	res.render('video', {title: 'Express', gif: req.params.gif_name});
});

module.exports = router;
