/**
 * Created by kyle on 20/5/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Image = new Schema({
    _id : {type: String, index: true},
    name: {type: String, required: true},
    title: {type: String},
    description: {type: String},
    direct_url: {type: String},
    short_link: {type: String},
    view_count: {type: Number, default: 0},
    love_count: {type: Number, default: 0},
    source_video: {type: String},
    width: {type: Number, default: 0},
    height: {type: Number, default: 0},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Image', Image);

