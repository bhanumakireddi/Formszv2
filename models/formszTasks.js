var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var formsztasks = new mongoose.Schema({
		name:{ type: String, default: null },
		userGroup:{type:String,default:null},
		createdBy:{type:String,default:null},
		assignedUsers:[],
		assignedFormsz:[],
		assigned:[],
		description:{type:String,default:null},
		createdDateTime:{ type: Date, default: Date.now },
		isClosed:{type:Boolean,default:false}, //false-open,true-closed
		isDeleted:{type:Boolean,default:false},
		startDate:{ type: Date, default: Date.now },
		endDate:{ type: Date, default: Date.now },
		isAllowMap: {type:Boolean,default:false}
		
});
formsztasks.plugin(mongoosePaginate);
module.exports = mongoose.model('FormszTasks', formsztasks);

