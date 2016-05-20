/**
 * Created by kyle on 20/5/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Image = new Schema({
    id : {type: String, required: true},
    title: {type: String},
    description: {type: String},
    source_url: {type: String},
    short_link: {type: String},
    video_provider: {type: String},
    width: {type: Number, default: 0},
    height: {type: Number, default: 0},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Image', Image);

