/**
 * Created by kyle on 18/5/16.
 */
var shortid = require('shortid');
var serviceImage = require('../services/image');

module.exports = {
    renderHomePage: function (req, res) {
        var randomOffset = Math.floor(Math.random() * 31);
        console.log(randomOffset);
        serviceImage.getNewImages(4,0,function (err, newImages) {
            serviceImage.getHotImages(4, randomOffset,function (err, hotImages) {
                res.render('home',{
                    newImages: newImages,
                    hotImages: hotImages
                });
            });
        });


    },
    renderCreatePage: function (req, res){
        res.render('index', {title: 'Express'});
    },

    renderGifPage: function (req, res){
        var imageId = req.params.gif_name;
        if(!shortid.isValid(imageId)){
            return apiErrors.RESOURCE_NOT_FOUND.new().sendWith(res);
        }
        serviceImage.getImageById(imageId, function getImageCallback(err, image) {
            if (err) {
                return apiErrors.INTERNAL_SERVER_ERROR.new().sendWith(res);
            }

            if(!image){
                return apiErrors.RESOURCE_NOT_FOUND.new().sendWith(res);
            }

            console.log(image);
            return res.render('video', {image : image});
        });

    }
};