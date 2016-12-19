var mailer = require("nodemailer");
var smtpTransport = require("nodemailer-smtp-transport");
var express = require('express');
var router = express.Router();
var fs = require('fs');
var deviceinfo = require('../models/deviceinfo.js');
var Users = require('../models/user.js');
var utils = {
  sendautomail: function(toemail,textBody,subject)
{

    var transport = mailer.createTransport(smtpTransport({
    host : "mail.formsz.com",
    secureConnection : false,
	requireTLS: true, //Force TLS
    tls: {
        rejectUnauthorized: false
    },
    port: 587,
    auth : {
        user : "hello@formsz.com",
        pass : "mm@1234"
    }
}));
var mail = {
		from : "hello@formsz.com",
		to : toemail,
		subject : subject,
		html : textBody
		
	}	
	
transport.sendMail(mail, function(error, response) 
	{
		if (error) 
		{
			console.log(error);
			
		return false;

		}else
		{
		console.log("mail sent success");	
		}
	
		transport.close();
		return true;

	});	
	
},

 sendAutomailwithAttachment: function(toemail,textBody,subject,file,cc)
{

  var transport = mailer.createTransport(smtpTransport({
    host : "mail.formsz.com",
    secureConnection : false,
	requireTLS: true, //Force TLS
    tls: {
        rejectUnauthorized: false
    },
    port: 587,
    auth : {
        user : "hello@formsz.com",
        pass : "mm@1234"
    }
}));
var mail = {
		from : "hello@formsz.com",
		to : toemail,
		cc:cc,
		subject : subject,
		html : textBody,
		attachments: [  
         {   // filename and content type is derived from path
            path: file
        } 
        ]   
	}	
	
transport.sendMail(mail, function(error, response) 
	{
		if (error) 
		{
			console.log(error);
			
		return false;

		}else
		{
		console.log("mail sent success");	
		}
	
		transport.close();
		return true;

	});	
	
},
resformatpagination: function(res,statuscode,message,data,success,totcount,pageno){
	var resformat = {
  StatusCode:statuscode,
  message:message,
  success:success,
  data:data,
  PageNo:pageno,
  Totcount:totcount
  
 }
  return res.json(resformat);
},
pushNotifications: function(ids,body,title,data){
var FCM = require('fcm-node');
	var apiKey = 'AIzaSyA2n_wWHrJkCfriFJqojhCTqfBzH4nlA-8';
	var fcm = new FCM(apiKey);

var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)var 
  registration_ids:ids,

   collapse_key: 'Formsz Notification',
    notification: {
        "body" : body,
      "title" : title,
	  "click_action":"FCM_PLUGIN_ACTIVITY",
	  "icon": "myicon"
      
    },
    
    data:data
};

	fcm.send(message, function(err, messageId){
		if (err) {
			console.log("Something has gone wrong!",err);
		} else {
			console.log("Sent with message ID: ", messageId);
		}
	});

},
getdeviceKeys:function(userGroupname,callback)
{
	console.log(userGroupname);
  var keys=[];
 Users.distinct('_id',{groupname:userGroupname}, function (err, post) {
 
  deviceinfo.find({userId:{$in: post}},function (err, post1) {
	  
   if(post1)
    {
		console.log(post1);
		for(var i=0;i<post1.length;i++){
			keys.push(post1[i].deviceKey);
		}
    }
       
   console.log("post1==" + keys);
   callback(keys);
  });
  
  });
  return keys;
},

getdeviceKeysByUser:function(id,callback)
{
	var keys=[];
	console.log(id);
		deviceinfo.find({userId:{$in: [id]}}, function (err, post1) {
			
				console.log("post1=======" + post1);
				if(post1.length>0)
				{
					
					post1.forEach(function(grouplist){
						console.log(post1.length);
					keys.push(grouplist.deviceKey);
				
					});	 
				}
		callback(keys);					
	});
	 return keys;
},
generatePassword: function() {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }

        return retVal;
    },

defoultimageurl:"store/0672077b0000000000000000"

};
module.exports = utils;