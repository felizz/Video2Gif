
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');
var User = new Schema({

	_id: {type: String},
	fb_id: {type: String},
	name: {type: String},
	email: {type: String},
	avatar: {type: String},
	created_at: {type: Date, default: Date.now},
	updated_at: {type: Date, default: Date.now}
});

User.pre('save', function (next){
	var self = this;

	if(this.isNew){
			self._id = shortid.generate();
	}

	next();
});

module.exports = mongoose.model('User', User);