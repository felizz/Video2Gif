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
    hot_score: {type: Number},
    source_video: {type: String},
    width: {type: Number, default: 0},
    height: {type: Number, default: 0},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});


function createFindQueryWithDate(cat_id, higher_bound_date, lower_bound_date) {
    var find_q = {};
    //console.log(higher_bound_date);
    //console.log(lower_bound_date);

    if (lower_bound_date !== null && higher_bound_date !== null)
        find_q = {created_at: {$gte: lower_bound_date, $lte: higher_bound_date}};
    else if (lower_bound_date && higher_bound_date === null)
        find_q = {created_at: {$gte: lower_bound_date}};
    else if (lower_bound_date === null && higher_bound_date)
        find_q = {created_at: {$lte: higher_bound_date}};
    else
        find_q = null;

    //console.log(find_q);
    return find_q;
}

Image.statics.getImagesByNew = function(limit, offset, callback) {
        this.model('Image')
            .find()
            .skip(offset)
            .limit(limit)
            .sort({created_at: 'desc'})
            .exec(
                function(error, results) {
                    if (error) {
                        return callback(error);
                    }

                    return callback(null, results);
                }
            );
};

Image.statics.getImagesByHot = function(limit, offset, callback) {
    this.model('Image')
        .find()
        .skip(offset)
        .limit(limit)
        .sort({hot_score: 'desc'})
        .exec(
            function(error, results) {
                if (error) {
                    return callback(error);
                }

                return callback(null, results);
            }
        );
};

module.exports = mongoose.model('Image', Image);

