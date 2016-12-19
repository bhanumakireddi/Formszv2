var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Lience = require('../models/lience.js');

router.get('/LcStatus', function(req, res, next) {
    Lience.find({}, function(err, post) {
        if (post.length > 0) {
            var data = {}
            data.Total = eval(eval(decrypt(post[0].bc9342)) + eval(decrypt(post[0].a8835a6972c7)) + eval(decrypt(post[0].bc894578)));
            data.GET = eval(decrypt(post[0].ab8342));
            data.POST = eval(decrypt(post[0].bc894578));
            data.PUT = eval(decrypt(post[0].bc9342));
            data.DELETE = eval(decrypt(post[0].a8835a6972c7));
            data.Limit = eval(decrypt(post[0].a0af7b4552));
            res.json({
                LcData: data,
                "status": 200
            });
        } else {
            res.json({
                "message": "Invalid credentials",
                "status": 204
            });
        }
    });

});

function encrypt(text) {
    var cipher = crypto.createCipher('aes-256-ctr', 'magikminds');
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher('aes-256-ctr', 'magikminds');
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
module.exports = router;
