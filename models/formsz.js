var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var formszSchema = new mongoose.Schema({
 		name: String,
		version:{type:String,default:"1.0"},
		formType :{type:String,default:null},
		createdTime:{ type: Date, default: Date.now },
		createdBy:{type:String,default:null},
		isVisible:{type:Boolean,default:true},
		category:{type:String,default:null},
		FormSkeleton:{},
		alternativeMailid:{type:String,default:null},
		allocatedUsers:{type:String,default:null},
		formzCategory:{type:String,default:null},
		userGroup:{type:String,default:null},
		requiredField:[],
    isAllowMap:{type:Boolean,default:false},
    geoFields:[],
    description:{type:String,default:null}
});
formszSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Formsz', formszSchema);
