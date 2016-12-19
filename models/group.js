var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var groupSchema = new mongoose.Schema({
		name:{type:String,default:null},
		email:{type:String,default:null},
		phone:{type:String,default:null},
		isActive:{type:Boolean,default:false},
		description:{type:String,default:null},
		isDeleted:{type:Boolean,default:false},
		createdDateTime:{ type: Date, default: Date.now }
		//phone:{type:String,default:null}
	/* 	imageurl:{type:String,default:null}, 
		admingroup:{type:String,default:null} */
});
groupSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Group', groupSchema);

