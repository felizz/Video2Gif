var express = require('express');
var router = express.Router();
var indexController = require('../controllers/index');

module.exports = function (passport) {
    router.get('/', indexController.renderHomePage);

    router.get('/dang-nhap', passport.authenticate('facebook', { scope : 'email' }));

    router.get('/tao-anh', indexController.renderCreatePage);

    router.get('/:gif_name', indexController.renderGifPage);

    router.get('/ap1/v1/index/loadmore', indexController.handleLoadmoreImage);
    
    return router
};



