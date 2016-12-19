var express = require('express');
var router = express.Router();
var Formsz = require('../models/formsz.js');
var Formszallocation = require('../models/formszAllocation.js');
var FormszDetails = require('../models/formszDetails.js');
var Users = require('../models/user.js');
var ObjectID = require("bson-objectid");
var log = require('./log')(module);
var Tasks = require('../models/formszTasks.js');
 var pushNotifications = require('../routes/utils').pushNotifications;
var getdeviceKeys = require('../routes/utils').getdeviceKeys;
/* GET All Templates  */
router.get('/getallTemplates/:limit/:offset', function(req, res, next) {
    Formsz.paginate({
        formType: 'template',
        isVisible: true
    }, {
        page: req.params.offset,
        limit: req.params.limit,
        sort: {
            createdTime: -1
        }
    }, function(err, templates) {
        if (templates.docs.length > 0) {
            res.json({
                "templateList": templates,
                "status": 200
            });
        } else {
            res.json({
                "message": "No data found",
                "status": 204,
                templateList: {
                    docs: [],
                    limit: 0,
                    total: 0
                }
            });
        }
    });
});
router.get('/isFormszexits/:name', function(req, res, next) {
    Formsz.find({
        name: req.params.name,
        isVisible: true
    }, function(err, templates) {
        if (templates.length > 0) {
            res.json({
                "message": "Already exists",
                "status": 208
            });
        } else {
            res.json({
                "message": "Not exists",
                "status": 204
            });
        }
    });
});
// Get All Forms filter  by usergroup ,user
router.get('/getformszlist/:userid/:groupname', function(req, res, next) {
						
                Formsz.find({
                    $or: [{
                        userGroup: req.params.groupname,
                        isVisible: true
                    }, {
                        category: 'General',
                        isVisible: true
                    }]
                }, function(err, post1) {

                    if (post1.length > 0) {
						
                        var userdata = [];
                        post1.forEach(function(dbUserObj1) {
                            var alluser = dbUserObj1.allocatedUsers.split(",")
                            if (dbUserObj1.category == 'Private') {
                                var a = alluser.indexOf(req.params.userid);
                                //console.log(alluser);
                                if (a > -1) {
                                    userdata.push({
                                        _id: dbUserObj1.id,
                                        name: dbUserObj1.name,
                                        version: dbUserObj1.version,
                                        createdBy: dbUserObj1.createdBy,
                                        createdTime: dbUserObj1.createdTime,
                                        allocatedUsers: alluser,
                                        category: dbUserObj1.category,
                                        alternativeMailid: dbUserObj1.alternativeMailid,
                                        description: dbUserObj1.description
                                    });
                                }
                            } else {
                                userdata.push({
                                    _id: dbUserObj1.id,
                                    name: dbUserObj1.name,
                                    version: dbUserObj1.version,
                                    createdBy: dbUserObj1.createdBy,
                                    createdTime: dbUserObj1.createdTime,
                                    allocatedUsers: alluser,
                                    category: dbUserObj1.category,
                                    alternativeMailid: dbUserObj1.alternativeMailid,
                                    description: dbUserObj1.description
                                });
                            }

                        });
                        res.json({
                            "formslist": userdata,
                            "total": post1.total,
                            "limit": post1.limit,
                            "pages": post1.pages,
                            "status": 200
                        }); 
                    } else {
                        res.json({
                            "message": "No data found",
                            "status": 204
                        });
                    }

                });

       
  

});

//web
router.get('/getformszlistWeb/:groupname/:userid', function(req, res, next) {
    Users.find({
        groupname: req.params.groupname,
        type: 1,
        isDeleted: false
    }, function(err, post) {
        if (post.length > 0) {
            post.forEach(function(dbUserObj) {
                Formsz.find({
                    $or: [{
                        createdBy: dbUserObj.username,
                        isVisible: true
                    }, {
                        category: 'General',
                        isVisible: true
                    }]
                }, function(err, post1) {
                    if (post1.length > 0) {
                        var userdata = [];
                        post1.forEach(function(dbUserObj1) {
                            var alluser = dbUserObj1.allocatedUsers.split(",")
                            if (dbUserObj1.category == 'Private') {
                                var a = alluser.indexOf(req.params.userid);
                                //console.log(alluser);
                                if (a > -1) {
                                    userdata.push({
                                        _id: dbUserObj1.id,
                                        name: dbUserObj1.name,
                                        version: dbUserObj1.version,
                                        createdBy: dbUserObj1.createdBy,
                                        createdTime: dbUserObj1.createdTime,
                                        allocatedUsers: alluser,
                                        category: dbUserObj1.category,
                                        alternativeMailid: dbUserObj1.alternativeMailid,
                                        description: dbUserObj1.description
                                    });
                                }
                            } else {
                                userdata.push({
                                    _id: dbUserObj1.id,
                                    name: dbUserObj1.name,
                                    version: dbUserObj1.version,
                                    createdBy: dbUserObj1.createdBy,
                                    createdTime: dbUserObj1.createdTime,
                                    allocatedUsers: alluser,
                                    category: dbUserObj1.category,
                                    alternativeMailid: dbUserObj1.alternativeMailid,
                                    description: dbUserObj1.description
                                });
                            }

                        });
                        res.json({
                            "formslist": userdata,
                            "total": post1.total,
                            "limit": post1.limit,
                            "pages": post1.pages,
                            "status": 200
                        });
                    } else {
                        res.json({
                            "message": "No data found",
                            "status": 204
                        });
                    }

                });

            });
        } else {
            res.json({
                "message": "No data found",
                "status": 204
            });
        }

    });

});
// Get All Forms filter  by Usergroup & catagory
router.get('/getformszlists/:groupname/:catagory', function(req, res, next) {
    var fcategory = req.params.catagory;
    if (fcategory == "All") {
        fcategory = {
            $ne: null
        }
    }

    Users.find({
        groupname: req.params.groupname,
        type: 1,
        isDeleted: false
    }, function(err, post) {
        if (post.length > 0) {
            post.forEach(function(dbUserObj) {
                Formsz.find({
                    $or: [{
                        createdBy: dbUserObj.username,
                        isVisible: true,
                        category: fcategory
                    },{
                        category: 'General',
                        isVisible: true
                    }]
                }, function(err, post1) {
                    if (post1.length > 0) {
                        var userdata = [];
                        post1.forEach(function(dbUserObj1) {
                            var alluser = [];
                            if (dbUserObj1.allocatedUsers) {
                                alluser = dbUserObj1.allocatedUsers.split(",");
                            }

                            userdata.push({
                                _id: dbUserObj1.id,
                                formzCategory: dbUserObj1.formzCategory,
								requiredField: dbUserObj1.requiredField,
                                name: dbUserObj1.name,
                                version: dbUserObj1.version,
                                createdBy: dbUserObj1.createdBy,
                                createdTime: dbUserObj1.createdTime,
                                allocatedUsers: alluser,
                                category: dbUserObj1.category,
							    geoFields :dbUserObj1.geoFields,
                                alternativeMailid: dbUserObj1.alternativeMailid,
                                description: dbUserObj1.description,
								isAllowMap : dbUserObj1.isAllowMap
                            });
                        });
                        res.json({
                            "formslist": userdata,
                            "total": post1.total,
                            "limit": post1.limit,
                            "pages": post1.pages,
                            "status": 200
                        });
                    } else {
                        res.json({
                            "message": "No data found",
                            "status": 204
                        });
                    }
                });

            });
        } else {
            Formsz.find({
                category: fcategory,
                isVisible: true
            }, function(err, post1) {
                if (post1.length > 0) {
                    var userdata = [];
                    post1.forEach(function(dbUserObj1) {
                        try {
                            var alluser = dbUserObj1.allocatedUsers.split(",");
                        } catch (err) {
                            var alluser = [];
                        }


                        userdata.push({
                            _id: dbUserObj1.id,
                            formzCategory: dbUserObj1.formzCategory,
                            name: dbUserObj1.name,
							geoFields :dbUserObj1.geoFields,
                            version: dbUserObj1.version,
                            createdBy: dbUserObj1.createdBy,
                            createdTime: dbUserObj1.createdTime,
                            allocatedUsers: alluser,
                            category: dbUserObj1.category,
                            alternativeMailid: dbUserObj1.alternativeMailid,
							isAllowMap : dbUserObj1.isAllowMap
                        });
                    });
                    res.json({
                        "formslist": userdata,
                        "status": 200
                    });
                } else {
                    res.json({
                        "message": "No data found",
                        "status": 204
                    });
                }

            });
        }
    });
});
// Get All Forms filter  by Usergroup,From Date,Todate
router.get('/getformszlist/:groupname/:fromdate/:todate', function(req, res, next) {
    Users.find({
        groupname: req.params.groupname,
        type: 1,
        isDeleted: false
    }, function(err, post) {
        if (post.length > 0) {
            post.forEach(function(dbUserObj) {
                Formsz.find({
                    createdBy: dbUserObj.name,
                    createdTime: {
                        $gte: new Date(req.params.fromdate),
                        $lt: new Date(req.params.todate)
                    }
                }, function(err, post1) {
                    if (post1.length > 0) {
                        var userdata = [];
                        post1.forEach(function(dbUserObj1) {
                            userdata.push({
                                _id: dbUserObj1.id,
                                name: dbUserObj1.name,
                                version: dbUserObj1.version,
                                createBy: dbUserObj1.createdBy,
                                createdTime: dbUserObj1.createdTime,
                                category: dbUserObj1.category,
                                alternativeMailid: dbUserObj1.alternativeMailid
                            });
                        });
                        res.json(userdata);
                    }
                });
            });
        } else {
            res.json({
                "message": "No records inserted",
                "status": 204
            });
        }
    });
});

// Update Formsz Data
router.put('/:id', function(req, res, next) {
	var reqdatadata=[]
	console.log("dsfsdfdsfds" + JSON.stringify(req.body.requiredField));
	reqdatadata.push(req.body.requiredField);
	console.log(reqdatadata);
	req.body.requiredField=reqdatadata
	console.log(req.body.requiredField)
	
	
    Formsz.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
      //  console.log(req.body);
        if (err) {
            res.json({
                "message": "data not found",
                "status": 204
            });
        }
        //if(true)
        //{
        //delForms(req.params.id, req.body.FormSkeleton,function(ress){

        //updateforms(req.params.id, req.body.FormSkeleton,function(){
        //res.json({"Message":"No Data Found","status":200});
        //});

        //})

        //}
        res.json({
            "message": "Updated Successfully",
            "status": 200
        });
    });
});

//Get the Formsz filter by Id
router.get('/:id', function(req, res, next) {
    Formsz.findById(req.params.id, function(err, post) {
        if (err) return next(err);

        res.json(post);
    });
});

//Create Formsz
router.post('/create', function(req, res, next) {
	
	var reqdatadata=[]
	reqdatadata.push(req.body.requiredField);
	req.body.requiredField=reqdatadata
	
    var mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000);
    req.body._id = mongoid;
    if (req.body.category != 'Private') {
        req.body.isVisible = true;
    }
    req.body._id = mongoid;
    Formsz.find({
        name: req.body.name,
        isVisible: true,
        formType: req.body.formType
    }, function(err, post) {
        if (post.length > 0) {
            res.json({
                "message": "Formsz already  exits",
                "status": 208
            })

        } else {
            if (req.body.formType == "form") {
                if (req.body.requiredField != undefined) {
                    if (req.body.requiredField[0] == null && req.body.requiredField.length == 1) {
                        var data = []
                        data.push({
                            "message": "No records found"
                        });
                        req.body.requiredField = data;
                    }
                } else {
                    var data = []
                    data.push({
                        "message": "No records found"
                    });
                    req.body.requiredField = data;
                }
            }
            Formsz.create(req.body, function(err, post) {
                //Get the Private formsz
                if (post.category == 'Private') {
                    if (req.body.allocatedUsers) {
                        var allusers = req.body.allocatedUsers;
                        for (i = 0; i < allusers.length; i++) {

                            var formszallocation = new Formszallocation({
                                formId: mongoid,
                                allotateTo: allusers[i]
                            });

                            formszallocation.save(function(err, a) {
                                if (err) throw err;

                            });
                        }
                    }

                }
                 if (post.category == 'Private') {
                     var ids = [];
                    Users.find({
                        'username': {
                             $in: allusers
                         }
                    }, function(err, result) {
                        for (var i = 0; i < result.length; i++) {
                            ids.push(result[i]._id);
                         }
                          var value = getdeviceKeysByUser(ids, function(data) {
                             pushNotifications(value, "New Form Created", "New Form Created", {
                                 data: "New Form Created"
                              });
                          });
								
                     });
                 } else {
                     var value = getdeviceKeys(post.userGroup, function(data) {
                     pushNotifications(value, "New Form Created", "New Form Created", {
                        data: "New Form Created"
                    });
                 });
                 }
                log.info(req.body + "Created Successfully");
                res.json({
                    "status": "200",
                    "message": "Created Successfully"
                });
            });
        }
    });
});
// Delete Formsz by Id
router.delete('/delete/:id', function(req, res, next) {
    //check the tasks if aready exists then this should not be deleted
    Tasks.find({
        'assignedFormsz.formId': req.params.id
    }, function(err, post1) {
        if (post1.length > 0) {
            res.json({
                "status": 203,
                "message": "Few tasks alloted to this formsz ,so you cannot delete the forms. Please try again."
            });
        } else {
            Formsz.find({
                _id: req.params.id
            }, function(err, post) {
                if (post.length > 0) {
                    post[0].isVisible = false;
                    post[0].save(function(err, post) {
                         var value = getdeviceKeys(post.userGroup, function(data) {
											
                             pushNotifications(value, "Form deleted", "Form deleted", {
                                 data: "Form deleted"
                            });
                         });
                        res.json({
                            "status": 200,
                            "message": "Deleted Successfully"
                        });
                    });
                } else {
                    res.json({
                        "message": "No Data Found",
                        "status": 204
                    });
                }
            });

        }

    });
});

function updateforms(id, body, callback) {
    Formsz.find({
        _id: id
    }, function(err, post) {
        if (post.length > 0) {
            FormszDetails.find({
                formId: id
            }, function(err, post1) {
                if (post1.length > 0) {
                    //var obj2=JSON.parse(body);
                    var obj2 = body;
                    var fomrszkeys = [];
                    var i = 0;
                    for (i = 0; i < obj2.length; i++) {
                        fomrszkeys.push(obj2[i].lable);
                    }

                    var itemsProcessed = 0;
                    post1.forEach(function(dbUserObj1) {
                        itemsProcessed++;
                        //var obj=JSON.parse(dbUserObj1.record);
                        var obj = dbUserObj1.record;
                        var objstr = [];
                        var childkeys = [];
                        var i = 0;
                        for (i = 0; i < obj.length; i++) {
                            childkeys.push(obj[i].fieldName);
                            objstr.push(obj[i]);
                        }


                        var isUpdated = false;
                        var j = 0;
                        for (j = 0; j < fomrszkeys.length; j++) {
                            if (childkeys.indexOf(fomrszkeys[j]) == -1) {
                                isUpdated = true;
                                //objstr.push(JSON.stringify({fieldName:fomrszkeys[j],fieldValue:"",isPrimary:false}));
                                objstr.push({
                                    fieldName: fomrszkeys[j],
                                    fieldValue: "",
                                    isPrimary: false
                                });
                            }
                        }
                        if (isUpdated) {

                            dbUserObj1.record = "[" + objstr + "]";
                            dbUserObj1.save(function(err, a) {
                            });
                        }
                        if (itemsProcessed === post1.length) {
                            callback(true);
                        }
                    });



                } else {
                    callback(true);
                }

            });
        } else {
            callback(true);
        }
    });

}

function delForms(id, body, callback) {
    Formsz.find({
        _id: id
    }, function(err, post) {
        if (post.length > 0) {
            FormszDetails.find({
                formId: id
            }, function(err, post1) {
                if (post1.length > 0) {
                    var obj2 = body;
                    var fomrszkeys = [];
                    var i = 0;
                    for (i = 0; i < obj2.length; i++) {
                        fomrszkeys.push(obj2[i].lable);
                    }

                    var itemsProcessed = 0;
                    post1.forEach(function(dbUserObj1) {
                        itemsProcessed++;
                        //var obj=JSON.parse(dbUserObj1.record);
                        var obj = dbUserObj1.record;
                        var objstr = [];
                        var childkeys = [];
                        var i = 0;
                        for (i = 0; i < obj.length; i++) {
                            childkeys.push(obj[i].fieldName);
                            //objstr.push(JSON.stringify(obj[i]));
                            objstr.push(obj[i]);
                        }


                        var isDeleted = false;
                        var j = 0;
                        for (j = 0; j < childkeys.length; j++) {
                            if (fomrszkeys.indexOf(childkeys[j]) == -1) {
                                isDeleted = true;

                                obj.splice([j]);
                            }
                        }
                        if (isDeleted) {
                            //dbUserObj1.record=JSON.stringify(obj)
                            dbUserObj1.record = obj
                            dbUserObj1.save(function(err, a) {
                                console.log("Deleted..")
                            });
                        }
                        if (itemsProcessed === post1.length) {
                            callback(true);
                        }
                    });

                } else {
                    callback(true);
                }

            });
        } else {
            callback(true);
        }

    });
}

module.exports = router;
