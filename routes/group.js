var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Groups = require('../models/group.js');
var formidable = require('formidable');
var Users = require('../models/user.js');
var log = require('./log')(module);
var Formsz = require('../models/formsz.js');
var pushNotifications = require('../routes/utils').pushNotifications;
var getdeviceKeys = require('../routes/utils').getdeviceKeys;
var admins = [];
/* Get All UserGroups. */
router.get('/getgrouplist/:limit/:offset', function(req, res, next) {
    Groups.paginate({isDeleted: false}, {page: req.params.offset,limit: req.params.limit,sort: {createdDateTime: -1}}, function(err, Groups) {
        if (err) return next(err);
        res.json(Groups);
    });
});
//Get All UserGroups filter By UserGroup
router.get('/getgroupadmin/:groupname', function(req, res, next) {
    Groups.find({isDeleted: false,name: req.params.groupname}, function(err, Groups) {
        if (Groups.length > 0) {
            Users.find({groupname: data.name,type: 1,isDeleted: false}, function(err, Users) {
                if (Users.length > 0) {
                    res.json(Users.username);

                } else {
                    res.json({
                        "message": "No Data Found",
                        "status": 204
                    });
                }
            });
            res.json(Groups);
        } else {
            res.json({
                "message": "No Data Found",
                "status": 204
            });
        }
        if (err) return next(err);

    });
});

/* Get UnGroup List. */
router.get('/UMgrouplist', function(req, res, next) {
    Groups.find({isActive: false,isDeleted: false}, function(err, post) {
        if (post.length > 0) {
            res.json(post);
        } else {
            res.json({
                "message": "no data",
                "status": 204
            });
        }
    });
});
/*  Create group */
router.post('/create', function(req, res, next) {

       var Groups1=new Groups({
        name:req.body.name,
        email:req.body.email,
        phone:req.body.phone,
        isActive:req.body.adminList||false,
        description:req.body.description||null
       });
       //group Creation
              Groups.find({name:req.body.name,isDeleted:false}, function(err,groups){
                if(groups.length>0) {
                  res.json({"message":"Group already exists","status":204});
                }
                else {
                  Groups1.save(function (err, post) {
                    console.log("post===" + post);
                      Users.find({username:req.body.adminList},function (err, Users)
                          {
                            console.log("dsss========" + Users)
                            if(Users.length>0)
                            {
                              Users.forEach(function(dbUserObj)
                              {log.info(req.body.name);
                                dbUserObj.groupname=req.body.name;
                                dbUserObj.save(function (err, post) {
                                  console.log("save=====" + post)

                                });
                              });

                            }

                          });
                  });
                  log.info("Group:"+req.body.name+" Created Successfully!");
                  res.json({"message":"Group Created Successfully","status":200});
                }
              })

});

/* GET /get Group by id */
router.get('/:id', function(req, res, next) {
    Groups.find({_id: req.params.id}, function(err, post, next) {
        if (err) return next(err);
        if (post.length > 0) {
            var admindata = [];
            post.forEach(function(dbUserObj) {
                Users.find({groupname: null,type: 1,isDeleted: false}, function(err, admins) {

                    if (admins.length > 0) {
                        admins.forEach(function(dbUserObj1) {
                            admindata.push(dbUserObj1.username);
                        });
                        Users.find({groupname: dbUserObj.name,type: 1,isDeleted: false}, function(err, alladmins) {
                            if (alladmins.length > 0) {
                                res.json({
                                    _id: dbUserObj.id,
                                    name: dbUserObj.name,
                                    email: dbUserObj.email,
                                    phone: dbUserObj.phone,
                                    description: dbUserObj.description,
                                    Admin: alladmins[0].username,
                                    adminlist: admindata
                                });
                            } else {
                                res.json({
                                    _id: dbUserObj.id,
                                    name: dbUserObj.name,
                                    email: dbUserObj.email,
                                    phone: dbUserObj.phone,
                                    description: dbUserObj.description,
                                    Admin: null,
                                    adminlist: admindata
                                });
                            }
                        });
                    } else {
                        Users.find({groupname: dbUserObj.name,type: 1,isDeleted: false}, function(err, alladmins) {
                            if (alladmins.length > 0) {
                                res.json({
                                    _id: dbUserObj.id,
                                    name: dbUserObj.name,
                                    email: dbUserObj.email,
                                    phone: dbUserObj.phone,
                                    description: dbUserObj.description,
                                    Admin: alladmins[0].username,
                                    adminlist: []
                                });

                            } else {
                                res.json({
                                    _id: dbUserObj.id,
                                    name: dbUserObj.name,
                                    email: dbUserObj.email,
                                    phone: dbUserObj.phone,
                                    description: dbUserObj.description,
                                    Admin: null,
                                    adminlist: []
                                });
                            }

                        });
                    }
                });
            });
        } else {
            res.json({
                "message": "No Data Found",
                "status": 204
            });
        }
    });
});

/* Update Group details by ID*/
router.put('/Update/:id', function(req, res, next) {
    Groups.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
        if (err) return next(err);
        if (!post) {
            return next(err);
        } else {
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                if (!err) {
                    var data = JSON.parse(fields.data);
                    post.email = data.email;
                    post.phone = data.phone;
                    post.description = data.description || null;
                    if (data.Admin) //If admin is alloted to the group make it is=true;
                    {
                        post.isActive = true;
                    }
                    log.info(data.Admin);
                    post.save(function(err, post1) {
                        if (err) {
                            res.json({
                                "message": "Group already exits",
                                "status": 208
                            });

                        } else {
                            //Set new Admin to the group
                            Users.find({
                                username: data.Admin
                            }, function(err, Users) {
                                Users.forEach(function(dbUserObj) {
                                    dbUserObj.groupname = data.name;
                                    dbUserObj.save(function(err, post) {
                                        //if (err) return next(err);
                                    });
                                });
                            });
                            //assign all form to new admin
                            Formsz.update({
                                "createdBy": data.oldAdmin
                            }, {
                                $set: {
                                    "createdBy": data.Admin
                                }
                            }, {
                                multi: true
                            });


                            // make it Old Admin into  UMAdminlist
                            log.info(data.oldAdmin);
                            Users.find({
                                username: data.oldAdmin
                            }, function(err, Users) {
                                log.info(data.oldAdmin);
                                Users.forEach(function(dbUserObj) {
                                    dbUserObj.groupname = null;
                                    dbUserObj.save(function(err, post) {
                                        //if (err) return next(err);
                                    });
                                });
                            });
                            
                             var value = getdeviceKeys(post1.name, function(data) {
                                 pushNotifications(value, "Formsz-UG Notification", "Your Profile details has been updated by riot,please check once.", {
                                     data: "Updated Profile"
                                 });
                             });

                            log.info("Group Details Updated Successfully!");
                            res.json({
                                "message": "Details Updated Successfully",
                                "status": 200
                            });
                        }
                    });
                }
            });
        }
    });
});

/* DELETE Group using id */
router.delete('/delete/:id', function(req, res, next) {
    Groups.findById(req.params.id, function(err, post) {
        //console.log(post)
        //if (err) return next(err);
        if (!post) {

            //return next(err);
        } else {
            console.log(post);
            post.isDeleted = true;
            post.save(function(err) {
                //if (err) throw err;
                Users.find({groupname: post.name,type: 1}, function(err, Users) {
                    Users.forEach(function(dbUserObj) {
                        dbUserObj.groupname = null;
                        dbUserObj.save(function(err, post2) {
                            //if (err) return next(err);
                        });
                    });
                });
            });
			  var value = getdeviceKeys(post.name,function(data){
    pushNotifications(value,"Formsz-UG Notification","User Group Deleted.",{data:"User Group Deleted"});
    });
    res.json({
        "message": "Deleted Successfully",
        "status": 200
    })
        }
    });
  
});

module.exports = router;
