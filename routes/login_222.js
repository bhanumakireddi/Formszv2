var jwt = require('jwt-simple');
var passwordHash = require('password-hash');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Users = require('../models/user.js');
var mailer = require("nodemailer");
var sendautomail = require('../routes/utils').sendautomail;
//var pushNotifications = require('../routes/utils').pushNotifications;
//Service Test
router.get('/Encript/:data', function(req, res, next) {
    res.json({
        "message": encrypt(req.params.data)
    });

});
router.get('/Dcript/:data', function(req, res, next) {
    res.json({
        "message": decrypt(req.params.data)
    });

});
//Forgot password
router.post('/forgotpwd', function(req, res, next) {
    Users.find({
        $or: [{
            username: req.body.username
        }, {
            email: req.body.username
        }]
    }, function(err, post) {
        if (post.length > 0) {
            var decryptpassword = decrypt(post[0].password);

            body = "<body>Dear " + post[0].name + ",<br><br>Please find your new credentials in below<br><br> <strong>Username:</strong>" + req.body.username + "<br> <strong>Password :</strong> " + decryptpassword + "<br><br>Please login using the URL<br><br></body>"
            sendautomail(post[0].email, body, 'Automatic Reply:Account Credentials')


            res.json({
                "message": "Password sent to your mail,Please check once ",
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

//Login
router.post('/login', function(req, res, next) {
    console.log("Login Initiated...");

    //var  encryptpwd=crypto.createHash('md5').update(req.body.password).digest("hex") ;
    var encryptpwd = encrypt(req.body.password);
    console.log(encryptpwd)

    Users.find({
        $or: [{
            username: req.body.username,
            password: encryptpwd,
            isDeleted: false
        }, {
            email: req.body.username,
            password: encryptpwd,
            isDeleted: false
        }]
    }, function(err, post) {
        if (post.length > 0) {
            if (req.body.type == 2) {
                if (post[0].type == req.body.type) {
                    console.log("Login Success...");
                    res.json(genToken(post[0]));

                } else {
                    res.json({
                        "status": 204,
                        "message": "Invalid credentials"
                    });
                }
            } else {
                res.json(genToken(post[0]));
            }


        } else {
            res.json({
                "status": 204,
                "message": "Invalid credentials"
            });
        }
    });

});

function genToken(user) {
    var expires = expiresIn(1); // 7 days
    var token = jwt.encode({
        exp: expires
    }, require('../config/secret')());
    return {
        token: token,
        expires: expires,
        user: user,
        "message": "Login Success",
        "status": 200
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}

function encrypt(text) {
    var cipher = crypto.createCipher('aes-256-ctr', 'magikminds');
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher('aes-256-ctr', 'magikminds');
    console.log(decipher);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}
module.exports = router;
