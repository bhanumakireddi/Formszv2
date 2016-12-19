var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var deviceinfo = require('../models/deviceinfo.js');

/*Update Device Key */
router.put('/add-editDiviceinfo/:id', function(req, res, next) {
    deviceinfo.find({
        userId: req.params.id
    }, req.body, function(err, post) {
        if (post.length > 0) {

            post[0].save(function(err, a) {
                res.json(a);
            });
        } else {
            deviceinfo.create(req.body, function(err, a) {
                res.json(a);
            });
        }

    });
});



module.exports = router;
