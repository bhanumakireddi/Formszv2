var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var formszDetailsSchema = new mongoose.Schema({
  formId :{type:String,default:null},
  taskId:{type:String,default:null},
  updatedTime:{ type: Date, default: Date.now },
  updatedBy:{type:String,default:null},
  record:[],
  isDeleted:{type:Boolean,default:false},
  lat:{type:String,default:null},
  long:{type:String,default:null},
  IsReassign:{type:Boolean,default:false},
  comments:{type:String,default:null},
  assignedTo:{type:String,default:null},
  status:{type:Boolean,default:false},
  fromType:{type:Boolean,default:false},
  DSAssignedTo:{type:String,default:null}

});
formszDetailsSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('FormszDetails', formszDetailsSchema);