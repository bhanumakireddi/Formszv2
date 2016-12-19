var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var formszCategory = require('../models/formszCategory.js');
var Formsz = require('../models/formsz.js');

/*Add-Edit FormsCategory */

router.post('/addFormszCategory', function(req,res,next){
  formszCategory.find({name: req.body.name,userGroup: req.body.userGroup},function(err, category) {
    if (category.length > 0) {
      res.json({"message": "Category already exits","status": 204});
         }
        else {
            formszCategory.create(req.body, function(err, a) {
              if(!err){
                res.json({"message": "Category created successfully","status": 200});
                       }
                     });
              }
  });
});
// //edit category
router.put('/editCategory/:id',function (req,res,next) {
  formszCategory.find({_id: req.params.id}, function(err, category) {
      if (category.length>0) {
            category[0].description = req.body.description;
            //post[0].name=req.body.name
            category[0].save(function(err, a) {
                res.json({
                    "message": "Updated successfully",
                    "status": 200
                });
            });
        }
});
});
router.get('/getFormszCatagory/:usergroup', function(req, res, next) {
    formszCategory.find({
        userGroup: req.params.usergroup
    }, function(err, post) {
        //if (err) return next(err);
        if (post.length > 0) {
            res.json({
                "data": post,
                "status": 200
            });
        } else {
            res.json({
                "message": "No categories avaliable,Please create new category",
                "status": 204
            });
        }

    });
});
router.get('/getFormszlistByCatagory/:usergroup', function(req, res, next) {
    Formsz.distinctAndCount("formzCategory", {
        "name": /^a/i
    }, function(err, post) {
        //if (err) return next(err);
        if (post.length > 0) {
            res.json({
                "data": post,
                "status": 200
            });
        } else {
            res.json({
                "message": "No categories avaliable,Please create new category",
                "status": 204
            });
        }

    });
    res.json({
        "message": "No categories avaliable,Please create new category",
        "status": 204
    });
});


router.delete('/:id', function(req, res, next) {
    formszCategory.findByIdAndRemove(req.params.id, req.body, function(err, post) {
        if (!post) {
            res.json({
                "message": "No categories found",
                "status": 204
            });
        } else {
            if (err) return next(err);

            Formsz.update({
                "formzCategory": post.name
            }, {
                $set: {
                    "formzCategory": "Others"
                }
            }, {
                multi: true
            });
            res.json({
                "message": "Deleted Successfully",
                "status": 200
            });

        }

    });
});

module.exports = router;
