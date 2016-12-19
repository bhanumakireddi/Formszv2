var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var userSchema = new mongoose.Schema({
		id:String,
 		username: String,
		password: {type:String,default:'81ab561d14b1cc'},
		name:{type:String,default:null},
		type :{type:String,default:null},
		email:{type:String,default:null},
		phone:{type:String,default:null},
		groupname:{type:String,default:null},
		isDeleted:{type:Boolean,default:false},
		imageurl:{type:String,default:null},
		isUserLocatorActive :{type:Boolean,default:true},
		isUserUpdatePermissionActive:{type:Boolean,default:true},
		admingroup:{type:String,default:null},
		createdDateTime:{ type: Date, default: Date.now }
});
userSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Users', userSchema);

