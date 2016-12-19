var mongoose = require('mongoose');
var LienceSchema = new mongoose.Schema({
		id:String,
 		Accountid: String,
		ab8342:String,//GET
		bc894578 :String,//POST
		a8835a6972c7:String,//DELETE
		bc9342:String,//PUT
		a0af7b4552:String //Limit
});
module.exports = mongoose.model('Lience', LienceSchema);

