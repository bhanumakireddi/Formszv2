var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var FormszDetails = require('../models/formszDetails.js');
var DisplayValues = require('../models/displayValues.js');
var Formsz = require('../models/formsz.js');
var mongoid = mongoose.Types.ObjectId();
var excelbuilder = require('msexcel-builder');
var sendAutomailwithAttachment = require('../routes/utils').sendAutomailwithAttachment;
var fs = require('fs');
var Tasks = require('../models/formszTasks.js');
var async = require('async');

router.get('/getPrePopulatedDataforUser/:taskId/:user', function (req, res, next) {
	var data = [];
	var taskdata = {}
	var DisplayValues = []
	var DisplayValuesdata = {}
	Tasks.find({_id : req.params.taskId}, function (err, post) {
		if (post.length > 0) {
			var formsids = []
			var count = 0;
			async.forEachSeries(post[0].assignedFormsz, function (formsz, callback) {
				prepopdatajson(formsz.formId, req.params.taskId, req.params.user, function (ress) {
					data.push(ress);
				});
				callback();
				setTimeout(function () {
					res.json(data)
				}, 1000);
			});
		} else {
			res.json({
				"message" : "No data found",
				"status" : 200
			});
		}
	});
});

//Get All Re-Assign Records
router.get('/getReAssignForms', function (req, res, next) {
	FormszDetails.find({IsReassign : true}, req.body, function (err, post) {
		res.json(post);
	});
});
router.get('/getRe-assginedRecods/:id/:user', function (req, res, next) {
	FormszDetails.find({IsReassign : true,updatedBy : req.params.user,formId : req.params.id,status : true}, function (err, post1) {
		if (post1.length > 0) {
			res.json(post1);

		} else {
			res.json({
				message : "No data found",
				status : 204
			});
		}
	});
});

//get latlong data
router.get('/getLatLongWIthForm/:formId/:taskId/:user', function (req, res, next) {
	var data = {};

	Tasks.find({_id : req.params.taskId,isDeleted : false}, function (err, tasks) {
		if (tasks.length > 0) {
				latlongjson(req.params.formId, req.params.taskId, req.params.user, function (ress) {
					data = {
						latlngData : ress
					}
				});
				setTimeout(function () {
					res.json({
						"data" : data,
						"status" : 200
					})
				}, 1000);

		} else {
			res.json({
				"message" : "No data found",
				"status" : 204
			});
		}
	})
});

function latlongjson(formId, taskId, user, callback) {

	Formsz.find({_id : formId,isVisible : true}, function (err, formsz) {
		var latlongData = [];
		var latlongDataDetails = {};
		var task = [];
		var locationDetails = {};
		if (formsz.length > 0) {
			var mapFields = [];
			latlongDataDetails.formId = formsz[0]._id;
			mapFields = formsz[0].geoFields;
			FormszDetails.find({formId : formId,taskId : taskId,DSAssignedTo : user}, function (err, details) {
				var taskdata = {};
				var locations = [];
				if (details.length > 0) {
					async.forEachSeries(details, function (recorddata, next) {
						taskdata.recordId = recorddata._id;

						for (var i = 0; i < mapFields.length; i++) {
							var values = recorddata.record[0][mapFields[i]];
							if (values == "") {
								locationDetails.lat = "";
								locationDetails.long = "";
								locations.push(locationDetails);
								locationDetails = {};
								taskdata.geometries = locations;
							} else {
								var res = values.split(",");
								locationDetails.lat = res[0];
								locationDetails.long = res[1];
								locations.push(locationDetails);
								locationDetails = {};
								taskdata.geometries = locations;
							}
						}
						setTimeout(function () {}, 1000);
						task.push(taskdata);
						taskdata = {};
						locations = [];
						next();
					})
				}

			})
			latlongDataDetails.records = task;
			latlongData.push(latlongDataDetails);
			callback(latlongData);

		}
	})
}


//download Service for prepopulatedData
router.get('/downloadService/:taskId/:formId/:user', function (req, res, next) {
	var data = [];
		Tasks.find({_id : req.params.taskId,isDeleted : false}, function (err, tasks) {
		if (tasks.length > 0) {
				downloadjson(req.params.formId, req.params.taskId, req.params.user, function (ress) {
					data.push(ress);
				});
				setTimeout(function () {
					res.json(data)
				}, 1000);

		//	});
		} else {
			res.json({
				"message" : "No data found",
				"status" : 204
			});
		}
	});
});
function downloadjson(id,taskid, user, callback) {
	var reqfields = {};
	var taskdata = {};
	var DisplayValues = [];
	var DisplayValuesData = {};
	var DownloadRecordsData = {};
	var DownloadRecords = [];
	var AllFieldsData = {};
	var AllFields = [];
	var i = 0;
	var DownloadedFormsz = [];
	var values = {};
	var DownloadedFormszData = {};
	Formsz.find({_id : id}, function (err, formsz) {
		if (formsz.length > 0) {
			if (formsz[0].requiredField[0] == null) {
				reqfields = [];
				taskdata.formId = formsz[0]._id;
				taskdata.FormName = formsz[0].name;
				callback(taskdata);
			} else {
				reqfields = Object.keys(formsz[0].requiredField[0]);
				taskdata.formId = formsz[0]._id;
				taskdata.FormName = formsz[0].name;
				FormszDetails.find({formId : id,taskId : taskid,DSAssignedTo : user}, function (err, formszDetails) {
					if (formszDetails.length > 0) {
						formszDetails.forEach(function (recorddata) {
							values = Object.keys(recorddata.record[0]);
							DownloadRecordsData.recordId = recorddata._id
								for (var i = 0; i < reqfields.length; i++) {
									DisplayValuesData.fieldId = reqfields[i];
									DisplayValuesData.fieldIdName = recorddata.record[0][reqfields[i]];
									DisplayValues.push(DisplayValuesData);
									DisplayValuesData = {};
								}
								setTimeout(function () {}, 1000);
							DownloadRecordsData.DisplayValues = DisplayValues;
							DisplayValues = [];

							for (var i = 0; i < values.length; i++) {
								//AllFieldsData.fieldId = values[i];
								//AllFieldsData.fieldIdName = recorddata.record[0][values[i]];
								 AllFieldsData[values[i]] = recorddata.record[0][values[i]];
								AllFields.push(AllFieldsData);
								AllFieldsData = {};
							}
							setTimeout(function () {}, 1000);
							DownloadRecordsData.AllFields = AllFields;
							AllFields = [];
							DownloadRecords.push(DownloadRecordsData);
							taskdata.DownloadRecords = DownloadRecords;
							DownloadRecordsData = {}
						});
						callback(taskdata);
					} else {
						taskdata.DownloadRecords = DownloadRecords;
						callback(taskdata);
					}
				});
			}
		}
	});
}

router.get('/getRe-assginedRecods/:formId/:user', function (req, res, next) {
 var allrecords = [];
 var data = [];
 var resultJson = {};
 FormszDetails.find({updatedBy : req.params.user,IsReassign:true,formId:req.params.formId}, function (err, post) {
  if (post.length > 0) {
   post.forEach(function (displayobject) {
    DisplayValues.find({recordId : displayobject._id}, function (err, post1) {
     Formsz.find({  _id : post1[0].formId,  isVisible : true}, function (err, formobj) {
      Tasks.find({"assignedFormsz.formId" : formobj[0]._id,isVisible : true}, function (err, task) {
       resultJson.displayValues = post1[0].displayValues
        resultJson.type = task.length > 0 ? "Task" : "form"
        resultJson.startDate = task.length > 0 ? task[0].startDate : ""
        resultJson.endDate = task.length > 0 ? task[0].endDate : ""
        resultJson.description = task.length > 0 ? task[0].description : formobj[0].description
        resultJson.formId = formobj[0]._id
        resultJson.formName = formobj[0].name
				resultJson.FormSkeleton = formobj[0].FormSkeleton
				resultJson.requiredField = formobj[0].requiredField
				resultJson.recordId=	displayobject._id
        resultJson.taskId = task.length > 0 ? task[0]._id : ""
        resultJson.taskName = task.length > 0 ? task[0].name : ""
        resultJson.comments = displayobject.comments
        data.push(resultJson);
       resultJson = {};
      });
     });
    });
   });
   setTimeout(function () {
    res.json(data)
   }, 1000);
  } else {
   res.json({
    "message" : "No data found",
    "status" : 204
   })
  }
 });
});

router.get('/getReForms/:user', function (req, res, next) {
	FormszDetails.distinct("formId", {IsReassign : true,updatedBy : req.params.user,status : true}, function (err, post1) {
		if (post1.length > 0) {
			getFormname(post1, function (ress) {
				res.json(ress);
			});
		} else {
			res.json({
				message : "No data found",
				status : 204
			});
		}
	});
});

/* GET /get user records based on FormId */
router.get('/:formid/:user/:taskId', function (req, res, next) {

		Formsz.find({_id : req.params.formid,isVisible : true}, function (err, post) {
			if (post.length > 0) {
				FormszDetails.find({formId : req.params.formid,updatedBy : req.params.user,taskId : req.params.taskId,isDeleted : false}, function (err, post1) {
					if (post1.length > 0) {
						var userdata = [];
						post1.forEach(function (dbUserObj1) {
							userdata.push(dbUserObj1.record[0]);
						});
						res.json({
							formName : post[0].name,
							Skelton : post[0].FormSkeleton,
							records : userdata,
							DisplayFields : post[0].requiredField
						});
					} else {
						res.json({
							"message" : "No records inserted",
							formName : post[0].name
						});
					}
				});

			} else {
				res.json({
					"message" : "No data found",
					"status" : 204
				});
			}
		});
	
});

// get prePOPRecords for user
router.get('/getprePOPRecords/:user/:formId/:recordId', function(req, res, next) {
    FormszDetails.find({DSAssignedTo: req.params.user,formId: req.params.formId,_id: req.params.recordId,isDeleted: false}, function(err, userdetails) {
        var data = [];
        if (userdetails.length > 0) {
            async.forEach(userdetails, function(item) {
                data.push({
                    prepopulatedData: item.record,
                    taskId: item.taskId
                });
            });
            res.json(data);
        } else {
            res.json({
                "message": "No data found",
                "status": "204"
            });
        }
    });
});
router.get('/getPrePOPData/:formid/:user/:taskId', function (req, res, next) {

	Formsz.find({_id : req.params.formid,isVisible : true}, function (err, post) {
		if (post.length > 0) {
			FormszDetails.find({formId : req.params.formid,DSAssignedTo : req.params.user,updatedBy : null,taskId : req.params.taskId,isDeleted : false}, function (err, post1) {
				if (post1.length > 0) {
					var userdata = [];
					post1.forEach(function (dbUserObj1) {
						userdata.push({
							record : dbUserObj1.record[0],
							recordId : dbUserObj1._id
						});
					});
					res.json({
						Skelton : post[0].FormSkeleton,
						records : userdata,
						DisplayFields : post[0].requiredField
					});
				} else {
					res.json({
						Skelton : post[0].FormSkeleton,
						records : [],
						DisplayFields : post[0].requiredField
					});
				}
			});

		} else {
			res.json({
				"message" : "No data found",
				"status" : 204
			})
		}
	});
});

//Get Formsz Details from Date and Todate
router.get('/getformszDetail/:formid/:user/:fromdate/:todate/:taskid', function (req, res, next) {
	var updatedby = req.params.user;
	if (updatedby == "All") {
		updatedby = {
			$ne : null
		}
	}
	Formsz.find({
		_id : req.params.formid,
		isVisible : true
	}, function (err, post) {
		if (post.length > 0) {
			FormszDetails.find({formId : req.params.formid,isDeleted : false,updatedTime : {$gte : new Date(req.params.fromdate),$lte : new Date(new Date(req.params.todate).setDate(new Date(req.params.todate).getDate() + 1))},updatedBy : updatedby,taskId : req.params.taskid}, function (err, post1) {
				if (post1.length > 0) {
					var userdata = [];
					var recordIds = [];
					var formInfo = {};
					var comment = [];
					var recordinfo = [];
					var reassinegdReocrdIds = [];
					formInfo.formId = post[0]._id;
					formInfo.createdBy = post[0].createdBy;
					formInfo.createdTime = post[0].createdTime;
					formInfo.description = post[0].description;

					post1.forEach(function (dbUserObj1) {
						if (dbUserObj1.IsReassign) {
							reassinegdReocrdIds.push(dbUserObj1._id);
						}
						dbUserObj1.record[0]._id = dbUserObj1._id;
						userdata.push(dbUserObj1.record[0]);
						recordIds.push(dbUserObj1._id);
						comment.push({
							"id" : dbUserObj1._id,
							"Comments" : dbUserObj1.comments,
							"updatedBy" : dbUserObj1.updatedBy,
							"assignedTo" : dbUserObj1.assignedTo,
						});
						recordinfo.push({
							"UpdatedBy" : dbUserObj1.updatedBy,
							"UpdatedTime" : dbUserObj1.updatedTime
						});
					});
					res.json({
						Skelton : post[0].FormSkeleton,
						records : userdata,
						recordIdsList : recordIds,
						formInfo : formInfo,
						reassignRecordIds : reassinegdReocrdIds,
						comments : comment,
						"recordInfo" : recordinfo
					});

					//res.json({Skelton:post[0].FormSkeleton,records:userdata});
				} else {
					res.json({
						"message" : "No Data Found",
						"status" : 204
					});
				}
			});
		} else {
			res.json({
				"message" : "No Data Found",
				"status" : 204
			});

		}
	});
});

//Get all Formsz Records
router.get('/getformszDetails', function (req, res, next) {
	FormszDetails.find({isDeleted : false}, function (err, todos) {
		res.json(todos);
	});
});

//get single record based on the ID
router.get('/:id', function (req, res, next) {
	FormszDetails.findOne({_id : req.params.id,isDeleted : false}, function (err, post) {
		if (err)
			return next(err);
		res.json(post);
	});
});

// Formsz Details
router.post('/create', function (req, res, next) {
	console.log(JSON.stringify(req.body));
	Formsz.find({_id : req.body.formId,isVisible : false}, function (err, post1) {
		if (post1.length > 0) {
			res.json({
				"message" : "This action cannot be performed as the form no longer exists",
				status : 203
			});
		} else {
			var displayrecords = [];
			var displaydata = {};
			var data = [];

			Formsz.find({
				_id : req.body.formId,
				isVisible : true
			}, function (err, formObj) {
				
				displayrecords = Object.keys(formObj[0].requiredField[0]);
			});
			FormszDetails.create(req.body, function (err, post) {
				setTimeout(function () {
					var i = 0;
					for (i = 0; i < displayrecords.length; i++) {
						displaydata.filedId = displayrecords[i]
						displaydata.filedValue=post.record[0][displayrecords[i]]||"";
						data.push(displaydata);
						displaydata = {};
					}
					var displayJosn = new DisplayValues
						({
							formId : post.formId,
							recordId : post._id,
							displayValues : data
						});
					displayJosn.save(function (err, a) {
						// if (err) throw err;
					})
					res.json({
						"message" : "Created Successfully",
						status : 200
					})
				}, 1000);
			});
		}
	});
});
//PUT /Update records/:id  online -offline
router.put('/:id', function (req, res, next) {
	req.body.DSAssignedTo = null;
	Formsz.find({_id : req.body.formId,isVisible : false}, function (err, post1) {
		if (post1.length > 0) {
			res.json({
				"message" : "This action cannot be performed as the form no longer exists",
				status : 203
			});
		} else {
			FormszDetails.findByIdAndUpdate(req.params.id, req.body, function (err, post) {

				res.json({
					"message" : "Updated Successfully",
					status : 200
				});
			});
		}
	});
});

// Re-Assign
router.post('/ReAssign', function (req, res, next) {
	var commnets = [];
	var data = req.body.recordsId;
	var i = 0;
	for (i = 0; i <= data.length; i++) {
		FormszDetails.find({_id : data[i]}, function (err, post) {
			if (post.length > 0) {
				post.forEach(function (reassginobjects) {
					var json = [];
					if (JSON.parse(reassginobjects.comments)) {
						json = JSON.parse(reassginobjects.comments);
					}
					json.push({
						"Comment" : req.body.comments,
						"UpdatedTime" : new Date()
					});
					reassginobjects.IsReassign = true;
					reassginobjects.status = true;
					reassginobjects.assignedTo = req.body.assignedTo;
					reassginobjects.comments = JSON.stringify(json);
					reassginobjects.save(function (err) {});

				});

			}

		});
	}
	res.json({
		"message" : "Re-Assign Successfully",
		"status" : 200
	})
});
//Delete Formsz Records
router.delete ('/delete/:id', function (req, res, next) {
	FormszDetails.find({_id : req.params.id}, function (err, post) {
		if (post.length > 0) {
			post.forEach(function (post1) {
				post1.isDeleted = true;
				post1.save(function (err, post) {
					if (err)
						return next(err);
					res.json({
						"status" : 200,
						"message" : "Deleted Successfully"
					});
				});
			});
		} else {
			res.json({
				"status" : 204,
				"message" : "No Data Found"
			});
		}
	});
});

router.get('/getRe-assginedRecodsMobile/:id', function (req, res, next) {
	//res.json({message:"hiiiii"})
	var allrecords = [];
	var data = [];
	var resultJson = {};
	FormszDetails.find({updatedBy : req.params.id,IsReassign:true}, function (err, post) {
		if (post.length > 0) {
			post.forEach(function (displayobject) {
				DisplayValues.find({recordId : displayobject._id}, function (err, post1) {
					Formsz.find({_id : post1[0].formId,isVisible : true}, function (err, formobj) {
						Tasks.find({"assignedFormsz.formId" : formobj[0]._id}, function (err, task) {
							resultJson.displayValues = post1[0].displayValues
							resultJson.recordId= displayobject._id
								resultJson.type = task.length > 0 ? "Task" : "form"
								resultJson.startDate = task.length > 0 ? task[0].startDate : ""
								resultJson.endDate = task.length > 0 ? task[0].endDate : ""
								resultJson.description = task.length > 0 ? task[0].description : formobj[0].description
								resultJson.formId = formobj[0]._id
								resultJson.formName = formobj[0].name
								resultJson.taskId = task.length > 0 ? task[0]._id : ""
								resultJson.taskName = task.length > 0 ? task[0].name : ""
								resultJson.comments = displayobject.comments
								data.push(resultJson);
							resultJson = {};
						});
					});
				});

			});

			setTimeout(function () {
				res.json(data)
			}, 1000);
		} else {
			res.json({
				"message" : "No data found",
				"status" : 204
			})

		}

	});
	
});
router.post('/download', function (req, res, next) {
	var headers=[];
	var headerslbl=[];
Formsz.find({_id:req.body.formid},function(err,post1)
	{
		 if(post1.length>0)
		{
			post1[0].FormSkeleton.forEach(function (recorddata) {
				console.log(recorddata.type.view)
				
			 	if(recorddata.type.view=="group" ||recorddata.type.view=="section" )
				{
					var data =recorddata.type.fields
					if(data.length>0)
					{
						for (var i=0;i<data.length;i++)
						{
							headers.push(recorddata.type.fields[i].id);
							headerslbl.push(recorddata.type.fields[i].lable)
						}
						
					}
					
				} 
				else
				{
				headers.push(recorddata.id);
				headerslbl.push(recorddata.lable)
				}
				
			});
		} 		
	})
	
	var updatedby = req.body.user;
	if (updatedby == "All") {
		updatedby = {
			$ne : null
		}
	}
	var emailids=[]
	emailids=req.body.records;
	console.log(emailids);
	FormszDetails.find({formId : req.body.formid,_id:{$in:emailids},isDeleted : false,updatedTime : {$gte : new Date(req.body.fromdate),$lte : new Date(new Date(req.body.todate).setDate(new Date(req.body.todate).getDate() + 1))},updatedBy : updatedby}, function (err, post) {
		if (post.length > 0) {
			fileid = mongoid;
			var workbook = excelbuilder.createWorkbook('./', mongoid + ".xlsx");
			var sheet1 = workbook.createSheet('sheet1', 100, 10000);
			var k = 1;
			var j = 1;
			var count=1
			for (var i = 0; i < post.length; i++) {
				for (var j = 0; j < headerslbl.length; j++) 
				{
					if (i == 0) {
						sheet1.set(j + 1, k, headerslbl[j]);
					}
				}
				var	data={}
				var	data=post[i].record[0];
				var theTypeIs = Object.keys(post[i].record[0]);
				console.log(theTypeIs.length)
				  for (var j = 0; j < theTypeIs.length; j++) 
				{
					if(headers.indexOf(theTypeIs[j])>-1)
					{
						sheet1.set(headers.indexOf(theTypeIs[j])+1,count+1, data[theTypeIs[j]]);
					}
					
					
				} 					
			count=count+1
			}
			workbook.save(function (err) {
				if (err)
					console.log(err);
				else
				console.log('congratulations, your workbook created');
				var buffer = fs.readFileSync("./" + mongoid + ".xlsx", {
						encoding : 'base64'
					});
				sendAutomailwithAttachment(req.body.mailid, "Dear User, Please find requested records in the attachement. ", "Formsz Records", "./" + mongoid + ".xlsx", req.body.altemail);
				res.json({
					"message" : "Mail sent successfully",
					"status" : 200
				});
			});
		}
		
	}); 
});

function getFormname(id, callback) {
	Formsz.find({_id : {$in : id}}, function (err, data) {
		callback(data);
	});
}

function prepopdatajson(id, taskid, user, callback) {
	var data = [];
	var taskdata = {}
	var reqfields = []
	var DisplayValues = [];
	var DisplayValuesData = {};
	var records = [];
	var recordsdata = {};
	var i = 0;
	Formsz.find({_id : id}, function (err, post1) {
		if (post1.length > 0) {
			if (post1[0].requiredField[0] == null) {
				reqfields = [];
				taskdata.formId = post1[0]._id;
				taskdata.FormName = post1[0].name;
				taskdata.isAllowMap = post1[0].isAllowMap;
				data.push(taskdata);
				taskdata = {};
				callback(data);

			} else {
				reqfields = Object.keys(post1[0].requiredField[0]);

				taskdata.formId = post1[0]._id;
				taskdata.FormName = post1[0].name;
				taskdata.isAllowMap = post1[0].isAllowMap;

				FormszDetails.find({formId : id,taskId : taskid,DSAssignedTo : user}, function (err, post3) {
					if (post3.length > 0) {
						post3.forEach(function (recorddata) {
							DisplayValuesData.recordId = recorddata._id
								for (var i = 0; i < reqfields.length; i++) {
									recordsdata.fieldId = reqfields[i];
									recordsdata.fieldIdName = recorddata.record[0][reqfields[i]];
									records.push(recordsdata);
									recordsdata = {};
								}
								setTimeout(function () {}, 1000);
							DisplayValuesData.record = records
								records = [];
							DisplayValues.push(DisplayValuesData);
							taskdata.DisplayValues = DisplayValues;
							DisplayValuesData = {}
						});
						data.push(taskdata);
						taskdata = {};
						callback(data);
					} else {
						data.push(taskdata);
						taskdata.DisplayValues = DisplayValues;
						callback(data);
					}
				});
			}
		}
	});
};

module.exports = router;