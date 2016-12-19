var mongoose = require('mongoose');
var DisplayValuesSchema = new mongoose.Schema({
  formId :{type:String,default:null},
  recordId:{type:String,default:null},
  displayValues:[],
 createdTime:{ type: Date, default: Date.now }

});
module.exports = mongoose.model('DisplayValues', DisplayValuesSchema);