
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	_id : {type: String, index: true},
	fb: {
		id: {type: String},
		name: {type: String},
		access_token: {type: String},
		firstName: {type: String},
		lastName: {type: String},
		email: {type: String},
		photo: {type: String}
	},
	twitter: {
		id: {type: String},
		token: {type: String},
		username: {type: String},
		displayName: {type: String},
		lastStatus: {type: String}
	},
	created_at: {type: Date, default: Date.now},
	updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('User', User);