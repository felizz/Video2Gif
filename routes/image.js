/**
 * Created by kyle on 9/5/16.
 */

var express = require('express');
var router = express.Router();
var imageController = require('../controllers/image');

/* Create Gif File Here */
router.post('/create-gif', imageController.handleCreateGif);

router.get('/:image_id/progress', imageController.handlePollImageProgress);

router.post('/:image_id/love', imageController.handleLove);

router.post('/:image_id/title/update', imageController.handleUpdateTitle);

router.post('/upload', imageController.handleUploadGif);

router.post('/delete', imageController.handleDeleteImage);

router.get('/login/:image_id', imageController.handleLoginToOwnImage);

router.get('/login/:image_id/callback', imageController.handleCallbackLoginToOwnImage, imageController.handleOwn);

router.get('/:image_id/owner_info', imageController.handleGetOwnerInfo);

module.exports = router;