var mongoose = require('mongoose');
var TokensSchema = new mongoose.Schema({
		id:String,
 		username: String,
		password: String,
		token:String,
		expireAt :new Date().toISOString()
		
});

module.exports = mongoose.model('Tokens', TokensSchema);

