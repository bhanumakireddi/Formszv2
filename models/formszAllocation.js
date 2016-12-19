var mongoose = require('mongoose');
var FormszallocationSchema = new mongoose.Schema({
		formId :{type:String,default:null},
		updatedTime:{ type: Date, default: Date.now },
		allotateTo:{type:String,default:null},
		type:{type:String,default:0},//0-first,1-re-assign
		status:{type:String,default:0}//0-first,1-re-assign
});
module.exports = mongoose.model('Formszallocation', FormszallocationSchema);

