var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var FormszDetails = require('../models/formszDetails.js');
var Formsz=require('../models/formsz.js');
var mongoid = mongoose.Types.ObjectId();
var excelbuilder = require('msexcel-builder');
var sendAutomailwithAttachment = require('../routes/utils').sendAutomailwithAttachment;
var fs = require('fs');

//Get All Re-Assign Records
router.get('/getReAssignForms', function(req, res, next) {
FormszDetails.find({IsReassign:true}, req.body, function (err, post) {
	res.json(post);
});
});
router.get('/getRe-assginedRecods/:id/:user', function(req, res, next) {
	FormszDetails.find({IsReassign:true,updatedBy:req.params.user,formId:req.params.id,status:true},function (err, post1)  {
		 if(post1.length>0)
		 {
				  res.json(post1);
			 
		 }
		 else 
		 {
			 res.json({message:"No data found",status:204});
		 } 
	}); 
});
router.get('/getReForms/:user', function(req, res, next) {
 FormszDetails.distinct("formId",{IsReassign:true,updatedBy:req.params.user,status:true},function (err, post1)  {
	 if(post1.length>0)
	 {
		 getFormname(post1,function(ress){
			  res.json(ress);
		 });
	 } else
	 {
		 res.json({message:"No data found",status:204});
	 } 
}); 
});

/* GET /get user records based on FormId */
router.get('/:formid/:user/:taskId', function(req, res, next) {
	Formsz.find({_id:req.params.formid,isVisible:true},function(err,post)
		{
			if(post.length>0)
			{	 FormszDetails.find({formId:req.params.formid,updatedBy:req.params.user,taskId:req.params.taskId,isDeleted:false},function (err, post1) 
				{
					if(post1.length>0)
					{	
						var userdata = [];
						post1.forEach(function(dbUserObj1) 
						{
							userdata.push(dbUserObj1.record[0]); 
						});
						res.json({Skelton:post1[0].FormSkeleton,records:userdata});
					}
					else
					{
						res.json({"Message":"No records inserted"});
					}
			}); 
			
		}else{
			res.json({"message":"No data found","status":204})
		}	
	});
});


//Get Formsz Details from Date and Todate
router.get('/getformszDetail/:formid/:user/:fromdate/:todate/:taskid', function(req, res, next) 
{
	var updatedby=req.params.user;
	 if(updatedby=="All")
	{
		updatedby={$ne:null}
	}
	Formsz.find({_id:req.params.formid,isVisible:true},function(err,post)
	{	
		if(post.length>0)
		{
			FormszDetails.find({formId:req.params.formid,isDeleted:false,updatedTime:{ $gte: new Date(req.params.fromdate),$lte:new Date(new Date(req.params.todate).setDate(new Date(req.params.todate).getDate()+1))},updatedBy:updatedby,taskId:req.params.taskid},function (err, post1) 
			{	
				if(post1.length>0)
				{
					var userdata = [];
					var recordIds = [];
					var comment = [];
					var formInfo ={};
					var reassinegdReocrdIds = [];
					formInfo.formId         = post[0]._id;
					formInfo.createdBy 		= post[0].createdBy;
					formInfo.createdTime	= post[0].createdTime;
				
				    
					post1.forEach(function(dbUserObj1) 
					{	
						console.log(dbUserObj1.IsReassign);
						if(dbUserObj1.IsReassign)
						{	
							reassinegdReocrdIds.push(dbUserObj1._id);
						}
						userdata.push(dbUserObj1.record[0]); 
						recordIds.push({"id":dbUserObj1._id,"updatedBy":dbUserObj1.updatedBy});
						comment.push({"id":dbUserObj1._id,"Comments":dbUserObj1.comments});
					});
					res.json({Skelton:post[0].FormSkeleton,records:userdata,recordIdsList:recordIds,formInfo:formInfo,reassignRecordIds:reassinegdReocrdIds,comments:comment});
					
							//res.json({Skelton:post[0].FormSkeleton,records:userdata});
				}else
				{
					res.json({"Message":"No Data Found","status":204});
				}
				});
		}
		else
		{
			res.json({"Message":"No Data Found","status":204});
			
		}
	});
});
//Get all Formsz Records
router.get('/getformszDetails', function(req, res, next) {
    FormszDetails.find({isDeleted:false},function (err, todos) {
    res.json(todos);
  });  
});

//get single record based on the ID
router.get('/:id', function(req, res, next) {
  FormszDetails.findById({_id:req.params.id,isDeleted:false}, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

//Update Formsz Details
router.post('/create', function(req, res, next) {
	console.log("req.bodyreq.bodyreq.bodyreq.body");
	console.log(req.body);
  FormszDetails.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});
//PUT /Update records/:id  online -offline
router.put('/:id', function(req, res, next) {
  FormszDetails.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
    res.json(req.body);
  });
});

// Re-Assign
router.post('/ReAssign', function(req, res, next) {
	var commnets=[];
	var data=req.body.recordsId;
	 var i=0;
	for(i=0;i<=data.length;i++)
	{
		FormszDetails.find({_id:data[i].id}, function (err, post) 
		{
			if(post.length>0)
			{
				post.forEach(function(reassginobjects)
				{
					var json=[];
					 if(JSON.parse(reassginobjects.comments))
					{
						console.log(JSON.parse(reassginobjects.comments));
						json=JSON.parse(reassginobjects.comments);
					} 
					json.push({"Comment":req.body.comments,"UpdatedTime":new Date()});
					reassginobjects.IsReassign=true;
					reassginobjects.status=true;
					reassginobjects.comments=JSON.stringify(json);
					reassginobjects.save(function(err) 
					{	
					});
			
				});
		
			}
	
		}); 
	} 
	res.json({"Message":"Re-Assign Successfully"})
});
//Delete Formsz Records
router.delete('/delete/:id', function(req, res, next) {
   FormszDetails.find({_id:req.params.id},function (err, post) {
	   if (post.length>0)
	   {
		   post.forEach(function (post1)
		   {
			   post1.isDeleted=true;
			   post1.save(function (err, post) {
				   if (err) return next(err);
					res.json({"status":200,"Message":"Deleted Successfully"});
			   });			   
		   });
	   }
	   else
	   {
		   res.json({"status":204,"Message":"No Data Found"});
	   }
  });
});

router.get('/download/:formid/:user/:fromdate/:todate/:mailid/:altemail', function(req, res, next) {
  FormszDetails.find({formId:req.params.formid,updatedBy:req.params.user,updatedTime:{ $gte: new Date(req.params.fromdate),$lt: new Date(req.params.todate)}},function (err, post) 
	{
		if(post.length>0)
		{
			fileid=mongoid;
			var workbook = excelbuilder.createWorkbook('./', mongoid+".xlsx") ;
			var sheet1 = workbook.createSheet('sheet1', 10, 12);
			var k=1;
			var j=1;
			for (var i = 0; i <post.length; i++) {
				for (var key in post[i]) {
					// skip loop if the property is from prototype
					if (!post[i].hasOwnProperty(key)) continue;
					var obj = post[i][key];
					for (var prop in obj) {
						// skip loop if the property is from prototype
						if(!obj.hasOwnProperty(prop)) continue;
						if(prop=="record"){						
								var data=JSON.parse(obj[prop]);
								for (var j = 0; j <data.length; j++) {
									if(i==0){sheet1.set(j+1,k , data[j].fieldName);}
									sheet1.set(j+1,k+1 , data[j].fieldValue);
								} 	
						}
					}
				}
				k=k+1;
			}
			workbook.save(function(err){
									if (err)
										console.log(err)
									else
									  console.log('congratulations, your workbook created');
								  var buffer = fs.readFileSync("./"+mongoid+".xlsx",{ encoding: 'base64' });
								  sendAutomailwithAttachment(req.params.mailid,"Dear User, Please find requesd Formsz rcods in the attachement. ","Formsz Records",buffer,req.params.altemail);
								  
								  });
		}
		res.json({"message":"Mail sent successfully","status":200});
	  });
});
function getFormname(id,callback)
{
		 Formsz.find({_id:{$in: id}},function(err,data){
						callback(data);
				}); 
}
module.exports = router;
