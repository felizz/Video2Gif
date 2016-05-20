/**
 * Created by kyle on 9/5/16.
 */

var express = require('express');
var router = express.Router();
var imageController = require('../controllers/image');

/* Create Gif File Here */
router.post('/create-gif', imageController.handleCreateGif);

module.exports = router;