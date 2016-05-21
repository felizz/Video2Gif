/**
 * Created by kyle on 9/5/16.
 */

var express = require('express');
var router = express.Router();


var gif_controller = require('../controllers/image');

/* Create Gif File Here */   
router.post('/create', gif_controller.handleCreateGif);


router.post('/poll', gif_controller.handlePollProgress);

module.exports = router;