var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var crypto = require('crypto');

//var multer  = require('multer');
//importsvar routes = require('./routes/index');
var login = require('./routes/login');
var todos = require('./routes/todos');
var licence = require('./routes/lience');
var users = require('./routes/users');
var store = require('./routes/store');
var group = require('./routes/group');
var admins = require('./routes/admin');
var formsz = require('./routes/formsz');
var log = require('./routes/log')(module);
var formszDetails = require('./routes/formszDetails');
var pushNotifications = require('./routes/pushNotifications');
var formszCategory = require('./routes/formszCategory');
var Tasks = require('./routes/formszTasks.js');
var mongoose = require('mongoose');
var Lience = require('./models/lience.js');

var connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
  process.env.OPENSHIFT_APP_NAME;
  
  db = mongoose.connect('mongodb://'+connection_string, function(err) {
    if(err) {
        console.log('connection error', err);
    } else {


        console.log('connection successful');
    }
});
var app = express();
 app.use(function(req, res, next){

   if(req.method== 'PUT'||req.method== 'POST'||req.method== 'DELETE')
   {
	  Lience.find({},function (err, post) 
	  {
		  console.log(eval(eval(decrypt(post[0].bc9342))+eval(decrypt(post[0].a8835a6972c7))+eval(decrypt(post[0].bc894578))))
		  //next();
		 if(req.url!="/login")
		 {		 
		 if(eval(eval(decrypt(post[0].bc9342))+eval(decrypt(post[0].a8835a6972c7))+eval(decrypt(post[0].bc894578)))<decrypt(post[0].a0af7b4552))
		  {
			  if(res.statusCode==200||res.statusCode==304)
			 {
				 switch(req.method) {
					case "PUT":
					post[0].bc9342=encrypt((parseInt(decrypt(post[0].bc9342))+1).toString());
						post[0].save(function(err) 
						{
							next();
						});
						break;
					case "POST":
						post[0].bc894578 = encrypt((parseInt(decrypt(post[0].bc894578))+1).toString());
						post[0].save(function(err) 
						{
							next();
						});
						break;
					case "DELETE":
						post[0].a8835a6972c7 = encrypt((parseInt(decrypt(post[0].a8835a6972c7))+1).toString());
						post[0].save(function(err) 
						{
							next();
						});
						break;
					default:
					//var value=parseInt(decrypt(post[0].ab8342));
						console.log(parseInt(decrypt(post[0].ab8342)));
						post[0].ab8342 = encrypt((parseInt(decrypt(post[0].ab8342))+1).toString());
						post[0].save(function(err) 
						{
							next();
						});	
				}
			 }else
			 {
				  next();
			 }
		  }else
		  {
			  res.status(202);
				res.json({
				"status": 202,
				"message": "Your licence has been expired "
				});
				
			   
		  }
		 }else
		 {
			 next();
		 }
		  
	  }); 
	  
   }else
   {
	   next();
   }
}); 

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});
// view engine setup
app.set('views', path.join(__dirname, '/views/'));
app.set('view engine', 'jade');
app.use(bodyParser.json({limit: '500mb'}));
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/* app.use(multer({ dest: './fileupload'})); */
app.all('/api/v1/*', [require('./middlewares/validateRequest')]);   
//app.use('/', routes);
app.use('/', login);
app.use('/api/v1/todos', todos);
app.use('/api/v1/users', users);
app.use('/api/v/store', store);
app.use('/api/v1/group', group);
app.use('/api/v1/admins', admins);
app.use('/api/v1/formsz', formsz);
app.use('/api/v1/formszDetails', formszDetails);
app.use('/api/v1/pushNotifications', pushNotifications);
app.use('/api/v1/formszCategory', formszCategory);
app.use('/api/v1/tasks', Tasks);
app.use('/api/v1/licence', licence);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
   res.render('error', {
      message: err.message,
      error: err
    });
  });
}
// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
function encrypt(text){
  var cipher = crypto.createCipher('aes-256-ctr','magikminds');
  var crypted = cipher.update(text,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
}
function decrypt(text){
  var decipher = crypto.createDecipher('aes-256-ctr','magikminds');
 // console.log(decipher);
  var dec = decipher.update(text,'hex','utf8');
  dec += decipher.final('utf8');
  return dec;
}

module.exports = app;

