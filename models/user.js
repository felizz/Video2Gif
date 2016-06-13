
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	fb: {
		id: {type: String},
		access_token: {type: String},
		firstName: {type: String},
		lastName: {type: String},
		email: {type: String}
	},
	twitter: {
		id: String,
		token: String,
		username: String,
		displayName: String,
		lastStatus: String
	}
});
module.exports = mongoose.model('User', User);