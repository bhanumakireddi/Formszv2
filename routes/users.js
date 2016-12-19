var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var Users = require('../models/user.js');
var fs = require('fs');
var formidable = require('formidable');
var Store = require('../models/store.js');
var mailer = require("nodemailer");
var ObjectID = require("bson-objectid");
var mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000);
var sendautomail = require('../routes/utils').sendautomail;
var deviceinfo = require('../routes/utils').deviceinfo;
var defoultImageurl = require('../routes/utils').defoultimageurl;
var getdeviceKeysByUser = require('../routes/utils').getdeviceKeysByUser;
var pushNotifications = require('../routes/utils').pushNotifications;
var generatePassword = require('../routes/utils').generatePassword;
var passwordGenerated = require('../routes/utils');
var Tasks = require('../models/formszTasks.js');
var log = require('./log')(module);

router.post('/createUserFromFile', function(req, res, next) {
    var data = req.body.userData;
    var i = 0;
    var existingUsers = [];
    var userNames;
    getUserList(data);

    function getUserList(data) {
        if (i < data.length) {
            Users.find({username: data[i].UserName}, function(err, userInfo) {
                mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000 + i);
                var passwordGenerateds = passwordGenerated.generatePassword();
                hashpassword = encrypt(passwordGenerateds);
                userNames = data[i].UserName;
                var users = new Users({
                    _id: mongoid,
                    name: data[i].Name,
                    phone: data[i].Phone,
                    email: data[i].Email,
                    username: data[i].UserName,
                    password: hashpassword,
                    imageurl: defoultImageurl,
                    groupname: req.body.groupName,
                    type: "2"
                })
                if (userInfo.length <= 0) {
                    users.save(function(err, user) {
                        i++;
                        getUserList(data);
                        // Mail Confirmation
                        var html = "<body>Dear " + user.name + ",<br><br> You are registered as a User and your details as below<br><br> <strong>Username : </strong>" + user.username + "<br> <strong>Password :</strong> " + passwordGenerateds + "<br><br>Please login using with above credentials.<br><br></body>"
                        sendautomail(user.email, html, "Automatic Reply: Account Confirmation");
                    });
                } else {
                    existingUsers.push(userNames);
                    i++;
                    getUserList(data);
                }
            });
        }
        if (i == data.length) {
            if (existingUsers.length == 0) {
                res.json({
                    "message": "Users Created Successfully",
                    "status": "200"
                });
            } else {
                if (existingUsers.length == data.length) {
                    res.json({
                        "message": "All Users already in use ",
                        "status": "208"
                    });
                } else {
                    res.json({
                        "message": " Usere Created Successfully except " + existingUsers.toString() + ".because they are already in use",
                        "status": "208"
                    });
                }
            }
        }
    }
});
/* GET all users. */
router.get('/getuserslist/:limit/:offset', function(req, res, next) {
    Users.paginate({isDeleted: false,type: 2}, { page: req.params.offset,limit: req.params.limit,sort: {createdDateTime: -1}}, function(err, Users) {
        if (err) return next(err);
        res.json(post);
    });
});
// Change Password
router.post('/pwdchange', function(req, res, next) {
    var hashpassword = encrypt(req.body.oldpassword);
    Users.find({username: req.body.username,password: hashpassword}, function(err, post) {
        if (post.length > 0) {
            post[0].password = encrypt(req.body.newpassword);
            post[0].save(function(err, a) {
                //log.info(req.body.username+"Password changed successfully");
                //log.info(getdeviceKeysByUser(post[0]._id));
                var userid = [];
                userid.push(post[0]._id);
                 var value = getdeviceKeysByUser(userid, function(data) {
                     pushNotifications(value, "Password Changes", "Your password has been by Admin,please check your Email.", {
                         data: "Password Change"
                     });
                 })
                res.json({
                    "message": "Password changed successfully",
                    "status": 200
                });
            });
        } else {
            res.json({
                "message": "Current password is Invalid,Please try again ",
                "status": 204
            });
        }
    });
});

/* GET usersGroups. */
router.get('/getusergrouplist/:groupname/:limit/:offset', function(req, res, next) {
    Users.paginate({groupname: req.params.groupname,type: 2,isDeleted: false}, {page: req.params.offset,limit: req.params.limit, sort: {createdDateTime: -1 } }, function(err, post) {
        res.json(post);
    });
});

//Get all users filter by GroupName
router.get('/getuserlistmaping/:groupname', function(req, res, next) {
    Users.find({groupname: req.params.groupname,type: 2,isDeleted: false}, function(err, post) {
        var guserdata = [];
        if (post.length > 0) {
            post.forEach(function(grouplist) {
                guserdata.push({
                    name: grouplist.username
                });
            });
            res.json(guserdata);
        } else {
            res.json({
                "message": "No Data Found",
                "status": 204
            });
        }
    });
});

/* Create users */
router.post('/create', function(req, res, next) {
    mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000);
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        if (!err) {
            var data = JSON.parse(fields.data);
            Users.find({ username: data.username }, function(err, post) {
                if (post.length > 0) {
                    
						 res.json({
                        "message": "User already exists",
                        "status": 208
                    })
					
                } else {
                    var Imgurl = "";
                    if (files.img) {
                        Imgurl = "store/" + mongoid;
                    } else {
                        Imgurl = defoultImageurl;
                    }
                    var data = JSON.parse(fields.data);

                    var Users1 = new Users({
                        username: data.username,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        groupname: data.groupname || null,
                        imageurl: Imgurl,
                        type: data.type,
                    });
                    //User or Admin Creation
                    Users1.save(function(err, post) {
                        if (err) {
                            res.status(208);
                        } else {
                            if (files.img) {
                                var path = files.img.path;
                                var buffer = fs.readFileSync(path);
                                var contentType1 = files.img.contentType;
                                var a = new Store({
                                    fileid: mongoid,
                                    data: buffer,
                                    contentType: contentType1
                                });
                                //Upload Image
                                a.save(function(err, a) {
                                    if (err) throw err;
                                    log.info(data.username + " : Upload Image Successfully!");
                                });

                                Imgurl = "store/" + mongoid;
                            }
                            // Mail Confirmation
                            var html = "<body>Dear " + data.name + ",<br><br> You are registered as a group user and your details as below<br><br> <strong>Username : </strong>" + data.username + "<br> <strong>Password :</strong> mm@1234<br><br>Please login using with above credentials.<br><br></body>"
                            sendautomail(data.email, html, "Automatic Reply: Account Confirmation");
                            /* 	var ids=[];
                            	ids.push()
                            	deviceinfo(post._id,) */
                            log.info("User:" + data.username + " Created Successfully!");
                            res.json({
                                "message": "User Created Successfully",
                                "status": 200
                            });
                        }
                    });
                }
            });
        }
    });
});
/* GET /users/id */
router.get('/:id', function(req, res, next) {
    Users.findById(req.params.id, function(err, post) {
        if (err) return next(err);
        res.json(post);
    });
});
/* Update user details*/
router.put('/Update/:id', function(req, res, next) {
    var Imgurl = "";
    mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000);
    Users.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
        //  if (err) return next(err);
        if (!post) {
            return next(err);
        } else {
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                if (!err) {
                    var imgurl = ""
                    if (files.img) {
                        Imgurl = "store/" + mongoid;
                    } else {
                        Imgurl = defoultImageurl;
                    }
                    //console.log(fields);
                    var data = JSON.parse(fields.data);
                    post.name = data.name;
                    post.email = data.email;
                    post.phone = data.phone;
                    post.type = data.type;

                    if (files.img) {
                        post.imageurl = Imgurl;
                    }

                    //Update the user details
                    post.save(function(err, post1) {
                        if (err) {
                            res.status(208);
                        } else {


                            if (files.img) {
                                var path = files.img.path;
                                var buffer = fs.readFileSync(path);
                                var contentType1 = files.img.contentType;
                                var a = new Store({
                                    fileid: mongoid,
                                    data: buffer,
                                    contentType: contentType1
                                });
                                //Upload Image
                                a.save(function(err, a) {
                                    //if (err) throw err;
                                    log.info(data.username + ": Upload Image Successfully!");
                                });
                            }
                            var html = "<body>Dear " + post1.name + ",<br><br> Your account details has been modified by the adminstartor.Please login and check the updates.<br></body>"
                            sendautomail(post1.email, html, "Automatic Reply: Account Updateds");
                             var value = getdeviceKeysByUser(post1._id, function(data) {
                                 pushNotifications(value, "Updated Profile", "Updated Profile", {
                                     data: "Updated Profile"
                                 });
                             });
                            log.info(data.username + ": User Details Updated Successfully!");
                            res.json({
                                "message": "User Details Updated Successfully",
                                "status": 200
                            });
                        }
                    });
                }
            });
        }
    });
});

/* DELETE --users:id */
router.delete('/:id', function(req, res, next) {
    Users.find({_id: req.params.id}, function(err, post) {
        if (post.length > 0) {
            Tasks.find({
                'assignedUsers.userId': req.params.id,
                isDeleted: false
            }, function(err, userIds) {
                if (userIds.length > 0) {
                    res.json({
                        "message": "User cannot be deleted as he is assigned in task",
                        "status": 203
                    });
                } else {
                    post[0].isDeleted = true;
                    post[0].save(function(err) {
                        if (err) throw err;

                        var html = "<body>Dear " + post[0].name + ",<br><br> Your account has been deleted by the adminstartor.<br></body>"

                        sendautomail(post[0].email, html, "Automatic Reply: Account Deletion")
                        var arr = [];
                        arr.push(post[0]._id);

                         var value = getdeviceKeysByUser(arr, function(data) {
                             pushNotifications(value, "Profile Notification", "Your Profile has been Deleted by admin", {
                                 data: "Deteleted Profile"
                             });
                         });

                        res.json({
                            "message": "Account Deleted Successfully",
                            "status": 200
                        });
                    });
                }

            });
        } else {
            res.json({
                "message": "No data found",
                "status": 204
            })
        }
    });
});

function encrypt(text) {
    var cipher = crypto.createCipher('aes-256-ctr', 'magikminds');
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

module.exports = router;
