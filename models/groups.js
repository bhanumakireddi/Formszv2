var mongoose = require('mongoose');
var groupSchema = new mongoose.Schema({
		name:{type:String,default:null},
		email:{type:String,default:null},
		phone:{type:String,default:null},
		isActive:{type:Boolean,default:false}
});
module.exports = mongoose.model('Group', groupSchema);

