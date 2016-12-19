var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var deviceinfo = new mongoose.Schema({
 		deviceKey: String,
		deviceType: {type:String,default:null},
		userId:{type:String,default:null},
		lastUpdated:{type: Date, default: Date.now }
});
//userSchema.plugin(mongoosePaginate); 
module.exports = mongoose.model('deviceInform', deviceinfo);

