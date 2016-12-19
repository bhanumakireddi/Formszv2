var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/user.js');
var fs = require('fs');
var formidable = require('formidable');
var Store = require('../models/store.js');
var Gruops = require('../models/group.js');
var sendautomail = require('../routes/utils').sendautomail;
var defoultImageurl = require('../routes/utils').defoultimageurl;
var mongoid = mongoose.Types.ObjectId();
var ObjectID = require("bson-objectid");
var log = require('./log')(module);
//var pushNotifications = require('../routes/utils').pushNotifications;
/* GET all admins */
router.get('/getadminslist/:limit/:offset', function(req, res, next) {
    Users.paginate({
        isDeleted: false,
        type: 1
    }, {
        page: req.params.offset,
        limit: req.params.limit,
        sort: {
            createdDateTime: -1
        }
    }, function(err, Users) {
        if (err) return next(err);
        res.json(Users);
    });
});
/* Get all UnGrouped Admins */
router.get('/UMadminslist', function(req, res, next) {
    Users.find({
        groupname: null,
        type: 1,
        isDeleted: false
    }, function(err, post) {
        if (post.length > 0) {
            res.json(post);
        } else {
            res.json({
                "message": "No Data Found",
                "status": 204
            });
        }
    });
});
//Get Mapped Users List
router.get('/mappedadminlist', function(req, res, next) {
    Users.find({
        groupname: null,
        type: 1
    }, function(err, post) {
        if (err) return next(err);
        if (post.length > 0) {
            res.json(post);
        } else {
            res.json({
                "message": "No Data Found",
                "status": 204
            });
        }
    });
});
/* Create Admins */
router.post('/create', function(req, res, next) {
    mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000);
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {

        if (!err) {
            var data = JSON.parse(fields.data);
            Users.find({
                username: data.username
            }, function(err, post) {
                if (post.length > 0) {
						 res.json({
                        "message": "Admin already exists",
                        "status": 208
					});
                } else {
                    var Imgurl = "";
                    if (files.img) {
                        Imgurl = "store/" + mongoid;
                    } else {
                        Imgurl = defoultImageurl;
                    }

                    var Users1 = new Users({
                        username: data.username,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        groupname: data.groupList || null,
                        imageurl: Imgurl,
                        type: data.type,
                    });
                    //Admin Creation
                    Users1.save(function(err, post) {
                        if (err) {
                            res.status(208);
                        } else {
                            Gruops.find({
                                name: data.groupList
                            }, function(err, post1) {
                                if (post1.length > 0) {
                                    post1[0].isActive = true;
                                    post1[0].save(function(err, post2) {});
                                }
                            });
                            var mail = "<body>Dear " + data.name + ",<br><br> You are registered as a group member and  your details are below<br><br> <strong>Username:</strong>" + data.username + "<br> <strong>Password :</strong> mm@1234<br><br>Please login wiht above credentials.<br><br></body>"
                            sendautomail(data.email, mail, "Automatic Reply: Account Confirmation");
                            log.info("Admin:" + data.username + " Created Successfully!");
                            if (files.img) {
                                log.info(files.img.path);
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
                                    log.info("Upload Image Successfully!");
                                });

                                Imgurl = "store/" + mongoid;
                            }
                            res.json({
                                "message": "Admin Created Successfully",
                                "status": 200
                            });
                        }
                    });

                }
            });
        }
    });

});
// Get Admin Details filter by ID
router.get('/:id', function(req, res, next) {
    Users.find({
        _id: req.params.id
    }, function(err, post) {
        if (err) return next(err);
        if (post.length > 0) {
            Gruops.find({
                isActive: false,
                isDeleted: false
            }, function(err, group) {
                if (group.length > 0) {
                    var UMGrouplist = []
                    group.forEach(function(grouplist) {
                        UMGrouplist.push(grouplist.name);
                    });
                    res.json({
                        _id: post[0].id,
                        username: post[0].username,
                        name: post[0].name,
                        email: post[0].email,
                        phone: post[0].phone,
                        groupname: post[0].groupname,
                        imageurl: post[0].imageurl,
                        grouplist: UMGrouplist
                    });
                } else {
                    res.json({
                        _id: post[0].id,
                        username: post[0].username,
                        name: post[0].name,
                        email: post[0].email,
                        phone: post[0].phone,
                        groupname: post[0].groupname,
                        imageurl: post[0].imageurl,
                        grouplist: []
                    });

                }
            });

        } else {
            res.json({
                "message": "No Data Found",
                "status": 204
            });
        }

    });
});
/*  -----------Update Admin details*/
router.put('/Update/:id', function(req, res, next) {
    var Imgurl = "";
    mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000);
    Users.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
        if (err) return next(err);
        if (!post) {
            return next(err);
        } else {
            var form = new formidable.IncomingForm();
            form.parse(req, function(err, fields, files) {
                if (!err) {
                    var imgurl = "";

                    if (files.img) {
                        console.log(console.log("img not null"))
                        Imgurl = "store/" + mongoid;
                    } else {

                        Imgurl = defoultImageurl;
                    }
                    var data = JSON.parse(fields.data);
                    post.name = data.name;
                    post.email = data.email;
                    post.phone = data.phone;
                    post.groupname = data.groupname || null;
                    if (files.img) {
                        post.imageurl = Imgurl;
                    }

                    post.type = data.type;
                    post.admingroup = data.admingroup || null;
                    //User or Admin Creation
                    post.save(function(err, post1) {
                        if (err) {
                            res.status(208);
                        } else {
                            Gruops.find({
                                name: data.groupname,
                                isDeleted: false
                            }, function(err, Gruops) {
                                if (Gruops.length > 0) {
                                    Gruops[0].isActive = true;
                                    Gruops[0].save(function(err, post1) {});
                                }
                            });
                            if (data.oldGroupname != null) {
                                Gruops.find({
                                    name: data.oldGroupname,
                                    isDeleted: false
                                }, function(err, Gruops) {
                                    if (Gruops.length > 0) {
                                        Gruops[0].isActive = false;
                                        Gruops[0].save(function(err, post1) {});
                                    }
                                });
                            }
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
                                    //log.info("Upload Image Successfully!");
                                });

                            }
                            //log.info("Admin Details Updated Successfully!");
                            // Delete old images
                            Store.findByIdAndRemove({
                                fileid: req.params.id
                            }, req.body, function(err, post) {});
                            var html = "<body>Dear " + post.name + ",<br><br> Your account has been modified by the adminstartor.Please login and check the updates.<br></body>"

                            sendautomail(post.email, html, "Automatic Reply: Account Updates");

                        }
                    });

                    res.json({
                        "message": "Admin Details Updated Successfully",
                        status: 200
                    });
                }
            });
        }
    });
});
/* DELETE /Admins/:id */
router.delete('/:id', function(req, res, next) {
    Users.findById(req.params.id, function(err, post) {
        if (err)
            return next(err);
        if (!post) {
            return next(err);
        } else {
            Gruops.find({
                name: post.groupname,
                isDeleted: false
            }, function(err, Gruops) {

                if (Gruops.length > 0) {
                    Gruops[0].isActive = false;
                    Gruops[0].save(function(err, post1) {
                        if (err) throw err;

                    });
                }
            });
            post.isDeleted = true;
            post.groupname = null;
            post.save(function(err) {
                if (err)
                    throw err;
                else {
                    res.json({
                        "message": "Admin Deleted Successfully",
                        "status": 200
                    })
                }

            });

            // Disble the Admins under this admin/id

            var html = "<body>Dear" + post.name + ",<br><br> Your account has been deleted by the adminstartor.<br></body>"
            sendautomail(post.email, html, "Automatic Reply: Account Deletion");

        }
    });

});

module.exports = router;
