/**
 * Created by kyle on 9/5/16.
 */

var express = require('express');
var router = express.Router();
var gif_controller = require('../controllers/gif')

/* Create Gif File Here */
router.post('/create', gif_controller.handleCreateGif);

module.exports = router;