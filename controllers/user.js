/**
 * Created by kyle on 28/12/15.
 */

var service_user = require('../services/user');
var serviceImage = require('../services/image');

var validator = require('utils/validator');

var user = {
    handleUserSignUp: function (req, res) {

        //Request Validation
        if(!validator.isEmail(req.body.email)){
            return res.status(400).json(returnCode.INPUT_PARAMETERS_INVALID);
        }

        //Service Orchestration
        service_user.signup(req.body.email, function signupCallback(err){
            if(err){
                return res.status(500).json(returnCode.INTERNAL_SERVER_ERROR);
            }

            return res.status(200).json(returnCode.REQUEST_SUCCESS);
        });
    },

    renderSignUpPage: function (req, res) {
        return res.render('signup/index', { pageTitle: "Đăng ký tài khoản", pageName: 'signup-page signin-page', pageJs: ['/js/signup.js']});
    },
    handleLoadmoreImage: function (req, res) {
        serviceImage.getImageById("By6VPkoQ", function (err, image) {
            if(err){
                return res.status(500).json(returnCode.INTERNAL_SERVER_ERROR);
            }
            console.log("da tim thay anh !!");
            console.log(image);
            return res.render('imageItem',{images: image})
        })
    }
    
};

module.exports = user;


