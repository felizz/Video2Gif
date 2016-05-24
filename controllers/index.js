/**
 * Created by kyle on 18/5/16.
 */
var shortid = require('shortid');
var serviceImage = require('../services/image');

module.exports = {

    renderHomePage: function (req, res){
        res.render('index', {title: 'Express'});
    },

    renderGifPage: function (req, res){
        var imageId = req.params.gif_name;
        if(!shortid.isValid(imageId)){
            return res.status(404).send('404 Page not found');
        }

        serviceImage.getImageById(imageId, function getImageCallback(err, image) {
            if (err) {
                return res.status(500).send('Internal Server Error');
            }

            if(!image){
                return res.status(404).send('404 Page not found');
            }
            //increse number of view, save and show 
            serviceImage.saveActionForImageById(image.loveNum,image.viewNum +1,imageId, function saveActionCallback(err, image) {
                if(err){
                    return res.status(500).send('Internal Server Error');
                }
                console.log(image);
                return res.render('video', {image : image});
            });
            
        });
    }
};