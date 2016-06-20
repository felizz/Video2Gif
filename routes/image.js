/**
 * Created by kyle on 9/5/16.
 */

var express = require('express');
var router = express.Router();
var imageController = require('../controllers/image');
var authMid = require('../controllers/middleware/auth');

/* Create Gif File Here */
router.post('/create-gif', imageController.handleCreateGif);

router.get('/:image_id/progress', imageController.handlePollImageProgress);

router.post('/:image_id/love', imageController.handleLove);

router.post('/:image_id/title/update', authMid.isAuthenticated, imageController.handleUpdateTitle);

router.post('/upload', imageController.handleUploadGif);

router.post('/delete', authMid.isAuthenticated, imageController.handleDeleteImage);

router.get('/:image_id/owner_info', imageController.handleGetOwnerInfo);

module.exports = router;