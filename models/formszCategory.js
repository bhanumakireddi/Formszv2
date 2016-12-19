var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var formszCategory = new mongoose.Schema({
		name:{ type: String, default: null },
		userGroup:{type:String,default:null},
		createdBy:{type:String,default:null},
		status:{type:Boolean,default:false},
		logo:{type:String,default:null},
		description:{type:String,default:null},
		createdDateTime:{ type: Date, default: Date.now }
});
formszCategory.plugin(mongoosePaginate);
module.exports = mongoose.model('FormszCategory', formszCategory);

