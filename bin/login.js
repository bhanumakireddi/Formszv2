var jwt = require('jwt-simple');
var passwordHash = require('password-hash');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/user.js');
router.post('/login', function(req, res, next) {
var username1 = req.body.username;
var password = req.body.password;
if (username1 == '' || password == '') {
res.status(401);
res.json({
"status": 401,
"message": "Invalid credentials"
});
return;
}
 Users.find({username:req.body.username,hashedPassword:crypto.createHash('md5').update(req.body.password).digest("hex") }, function (err, post) {
	  console.log(post);
	  if(post.length>0){
		  res.json(genToken(req.body.username));
	  }
	  else
	  {
		 res.status(204);
		res.json({
		"status": 204,
		"message": "Invalid credentials"
		});
	  }
  });

});
function genToken(user) {
var expires = expiresIn(1); // 7 days
var token = jwt.encode({
exp: expires
}, require('../config/secret')());
return {
token: token,
expires: expires,
user: user,
"Message":"Login Success"
};
}
function expiresIn(numDays) {
var dateObj = new Date();
return dateObj.setDate(dateObj.getDate() + numDays);
}


module.exports = router;
