var express = require('express');
var router = express.Router();
var indexController = require('../controllers/index');

router.get('/', indexController.renderHomePage);

router.get('/:gif_name', indexController.renderGifPage);

module.exports = router;
