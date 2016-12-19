var express = require('express');
var formidable = require('formidable');
var mongoose = require('mongoose');
var fs = require('fs');
var router = express.Router();
var Store = require('../models/store.js');
router.get('/:id', function(req, res, next) {
    Store.find({
        fileid: req.params.id
    }, function(err, post) {
        if (err) return next(err);
        if (post.length > 0) {
            res.setHeader('Content-Type', 'image/Jpeg');
            res.end(post[0].data);
        } else {
            res.status(208);
            res.json({
                "status": 208,
                "message": "No Data found"
            });
        }
    });
});

module.exports = router;
