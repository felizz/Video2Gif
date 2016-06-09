/**
 * Created by kyle on 9/5/16.
 */

var express = require('express');
var router = express.Router();
var imageController = require('../controllers/image');
var multipart  = require('connect-multiparty')();
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now()+".gif")
    }
});
var upload = multer({ storage: storage });


/* Create Gif File Here */
router.post('/create-gif', imageController.handleCreateGif);


router.get('/:image_id/progress', imageController.handlePollImageProgress);


router.post('/:image_id/love', imageController.handleLove);

router.post('/:image_id/title/update', imageController.handleUpdateTitle);

router.post('/upload',upload.single('fileToUpload'), imageController.handleUploadGif);

module.exports = router;