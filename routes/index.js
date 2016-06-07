var express = require('express');
var router = express.Router();
var indexController = require('../controllers/index');

router.get('/', indexController.renderHomePage);

router.get('/tao-anh', indexController.renderCreatePage);

router.get('/:gif_name', indexController.renderGifPage);

router.get('/ap1/v1/index/loadmore', indexController.handleLoadmoreImage);

module.exports = router;
