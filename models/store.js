var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var storeSchema = new mongoose.Schema({
		fileid:ObjectId,
		contentType:{type:String,default:null},
		data:Buffer 
});
module.exports = mongoose.model('Store', storeSchema);

