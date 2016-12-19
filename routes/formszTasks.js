var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Tasks = require('../models/formszTasks.js');
var Formsz = require('../models/formsz.js');
var FormszDetails = require('../models/formszDetails.js');
var DisplayValues1 = require('../models/displayValues.js');
var User = require('../models/user.js');
var ObjectID = require("bson-objectid");
var mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000);
var pushNotifications = require('../routes/utils').pushNotifications;
var getdeviceKeysByUser = require('../routes/utils').getdeviceKeysByUser;
var async = require('async');

//Update Tasks
var arr = [];
router.put('/:id', function(req, res, next) {

    Tasks.findByIdAndUpdate(req.params.id, req.body, function(err, post) {
        if (err) return next(err);
        if (req.body.assignedUsers) {
            var value = req.body.assignedUsers;
            for (var i = 0; i < value.length; i++) {
                arr.push(value[i].userId);
            }

             var value = getdeviceKeysByUser(arr, function(data) {
                 pushNotifications(value, "Task has been Updated", "Task Updated", {
                     data: "Task Updated"
                 });
            });
        }
        res.json({
            "data": post,
            "status": 200
        });
    });
});
//Create Task
router.post('/createTask', function(req, res, next) {
  console.log("req body===" + JSON.stringify(req.body))
    var arr = [];
   mongoid = ObjectID.createFromTime(new Date().getTime() + 15 * 60 * 1000);
    Tasks.find({
        name: req.body.name,
        userGroup: req.body.userGroup,
        isDeleted: false
    }, function(err, post) {
        if (post.length > 0) {
            res.json({
                "message": "This task already exists",
                "status": 204
            });
        } else {
            req.body._id = mongoid;
            Tasks.create(req.body, function(err, a) {
                if (a) {
                    if (req.body.uploadFileInfo) {
                        var data = []
                      async.forEach(req.body.uploadFileInfo,function (object) {
                        data = object .formInfo;
                        try {
                          var i = 0;
                          for (i = 0; i < data.length; i++) {
                              var record = []
                              record.push(data[i]);
                              FormDetails = new FormszDetails({
                                  formId: object.form,
                                  taskId: mongoid,
                                  DSAssignedTo: object.user,
                                  record: record
                              })
                              FormDetails.save(function(err, post) {
        var displayrecords = [];
        var displaydata = {};
        var data = [];
                Formsz.find({_id:object.form,isVisible:true},function (err,forms) {
                  displayrecords = Object.keys(forms[0].requiredField[0]);
                    setTimeout(function () {
                    if(displayrecords.length>0)
                    {
                      var i = 0;
                    for (i = 0; i < displayrecords.length; i++) {
                      displaydata.filedId = displayrecords[i]
                      displaydata.filedValue=post.record[0][displayrecords[i]]||"";
                      data.push(displaydata);
                      console.log("data===" + JSON.stringify(data));
                      displaydata = {};
                    }
                    var displayJosn = new DisplayValues1({
                        formId : post.formId,
                        recordId : post._id,
                        displayValues : data
                      });
                    displayJosn.save(function (err, a) {
                      res.json({
                        "message" : "Created Successfully",
                        status : 200
                      })
                    })

                    }
                }, 1000);
                })
         });
                          }
                        }
                        catch (error) {
                          console.log("req.body.uploadFileInfo[0].formInfo is not there" + error);
                        }
                      });
                    }
                    if (req.body.assignedUsers) {
                        var value = req.body.assignedUsers;
                        for (var i = 0; i < value.length; i++) {
                            arr.push(value[i].userId);
                        }
                       /*  var value = getdeviceKeysByUser(arr, function(data) {
                            pushNotifications(value, "New Task has been Created", "Task Created", {
                                data: "New Task Created"
                            });
                        }); */
                    }
                    res.json({
                        "message": "Task created successfully",
                        "status": 200
                    });
                }
            });
        }
    });

    //res.json({"message":"Task ctreated successfully","status":200});
});
//Get List of Tasks
router.get('/getTasks/:usergroup', function(req, res, next) {
    Tasks.find({userGroup: req.params.usergroup,isDeleted: false}, function(err, post) {
        //if (err) return next(err);
        if (post.length > 0) {
            res.json({
                "data": post,
                "status": 200
            });
        } else

        {
            res.json({
                "message": "No tasks avaliable",
                "status": 204
            });
        }

    });
});
//Get List of Tasks by user
router.get('/getTasksbyUser/:user', function(req, res, next) {
    Tasks.find({'assignedUsers.userId': req.params.user}, function(err, tasks) {
      var data = [];
      if(tasks.length>0)
      {
        async.forEach(tasks, function (task){
          getData(task,function(ress){
            data.push(ress);
          })
        })
        setTimeout(function () {
          res.json({
            "data" : data,
            "status" : 200
          })
        }, 1000);
            }
            else {
              res.json({
                  "message": "No tasks avaliable",
                  "status": 204
              });

            }
          })
      });

function getData(task,callback) {
  var jsondata={};
  var forms=[];
  var formids=[];
   form= task.assignedFormsz;
   for(var i=0;i<form.length;i++) {
     formids.push(form[i].formId);
   }
  Formsz.find({_id:{$in:formids},isVisible:true}, function(err,formsz){
    var formdata =  {};
    var formArray = [];
    var formdetails = {};
        if(formsz.length>0) {
      formsz.forEach(function(form){
        formdata.formId = form._id;
        formdata.formszCategory = form.formzCategory;
        formdata.formszDescription = form.description;
        formdata.formName=form.name;
        formArray.push (formdata);
        formdata = {};
      });
      task.assignedFormsz=formArray;
      jsondata = task;
      formArray = [];
        callback(jsondata);
    }
    else {
        console.log("no forms available to this task");
    }
  });
}

router.get('/getTasksbyformsz/:taskid/:user', function(req, res, next) {
    Tasks.find({_id: req.params.taskid,'assignedUsers.userName': req.params.user,'assigned.user':req.params.user}, function(err, tasks) {
      console.log(tasks);
      if (tasks.length > 0) {
          var formszSkalton = {}
          var forms = [];
         var ids = [];
         var formIds = [];
         ids = tasks[0].assigned;
         for(var i = 0;i<ids.length;i++) {
           if(ids[i].user == req.params.user) {
             formIds.push(ids[i].form);
           }
         }
         Formsz.find({_id:{$in:formIds}}, function(err, post1) {
            if(post1.length>0) {
              post1.forEach(function(formszdate) {
                  formszSkalton.formName = formszdate.name;
                  formszSkalton.formId = formszdate._id;
                  formszSkalton.formzCategory = formszdate.formzCategory;
                  formszSkalton.formszDescription = formszdate.description
                  forms.push(formszSkalton);
                  formszSkalton = {};
              });
              res.json({
                  "data": forms,
                  "status": 200
              });
            }
            else {
              res.json({"message":"No forms associated with this task"})
            }
          });
       }
       else
        {
            res.json({
                "message": "No tasks avaliable",
                "status": 204
            });
        }
      });
    });


router.get('/getUsersAndFormsAssinegdToTask/:taskid', function(req, res, next) {
    var formszSkalton = {}
    Tasks.find({_id: req.params.taskid}, function(err, taskInfo) {
        if (taskInfo)
            res.json({
                "forms": taskInfo[0].assignedFormsz,
                "users": taskInfo[0].assignedUsers,
                "status": 200
            });
        else
            res.json({
                "status": 204,
                message: " Task dosn't exists"
            });
    });

});

router.get('/getformszDetail/:formid/:user/:fromdate/:todate/:taskid', function(req, res, next) {
    var updatedby = req.params.user;
    if (updatedby == "All") {
        updatedby = {
            $ne: null
        }
    }
    Formsz.find({_id: req.params.formid,isVisible: true}, function(err, post) {
        if (post.length > 0) {
            FormszDetails.find({formId: req.params.formid,isDeleted: false,updatedTime: {$gte: new Date(req.params.fromdate),$lte: new Date(new Date(req.params.todate).setDate(new Date(req.params.todate).getDate() + 1))},updatedBy: updatedby, taskId: req.params.taskid}, function(err, post1) {
                if (post1.length > 0) {
                    var userdata = [];
                    var recordIds = [];
                    var formInfo = {};
                    var reassinegdReocrdIds = [];
                    formInfo.formId = post[0]._id;
                    formInfo.createdBy = post[0].createdBy;
                    formInfo.createdTime = post[0].createdTime;

                    post1.forEach(function(dbUserObj1) {
                        if (dbUserObj1.IsReassign) {
                            reassinegdReocrdIds.push(dbUserObj1._id);
                        }
						dbUserObj1.record[0]._id = dbUserObj1._id;
                        userdata.push(dbUserObj1.record[0]);
                        recordIds.push(dbUserObj1._id);
                    });
                    res.json({
                        Skelton: post[0].FormSkeleton,
                        records: userdata,
                        recordIdsList: recordIds,
                        formInfo: formInfo,
                        reassignRecordIds: reassinegdReocrdIds
                    });

                    //res.json({Skelton:post[0].FormSkeleton,records:userdata});
                } else {
                    res.json({
                        "message": "No Data Found",
                        "status": 204
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

//Get List of User and Formsz
router.get('/getTaskUsersFormszs/:groupname', function(req, res, next) {
    var data = {};
    var formszlist = {};
    var userslist = {};
    Formsz.find({userGroup: req.params.groupname,isVisible: true}, {name: 1}, function(err, post1) {
        if (post1.length > 0) {
            post1.forEach(function(formszdata) {
                formszlist[formszdata._id] = formszdata.name

            });
            User.find({
                groupname: req.params.groupname,
                isDeleted: false,
                type: 2
            }, {
                username: 1
            }, function(err, post) {
                post.forEach(function(userdata) {
                    userslist[userdata._id] = userdata.username
                });
                data.allForms = formszlist;
                data.allUsers = userslist;
                res.json(data);
            });
        } else {
            User.find({
                groupname: req.params.groupname,
                isDeleted: false,
                type: 2
            }, {
                username: 1
            }, function(err, post) {
                post.forEach(function(userdata) {
                    userslist[userdata._id] = userdata.username
                });
                data.allForms = formszlist;
                data.allUsers = userslist;
                res.json(data);
            });
            //res.json(data);
        }
    });

});
//Delete Task
router.delete('/deleteTask/:id', function(req, res, next) {
    Tasks.findByIdAndRemove(req.params.id, req.body, function(err, post) {
        if (!err) {
            var arr = [];
            var value = post.assignedUsers;
            for (var i = 0; i < value.length; i++) {
                arr.push(value[i].userId);
            }
             var value = getdeviceKeysByUser(arr, function(data) {
                 pushNotifications(value, "Task has been Deleted", "Task has been Deleted", {
                   data: "Task Deleted"
                 });
             });

            res.json({
                "status": 200,
                "message": "Deleted Successfully"
            });
        }
    });
});

module.exports = router;
