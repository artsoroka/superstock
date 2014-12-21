var express = require('express'),
	app = express(),
	home = express(); 

var mustacheExpress = require('mustache-express');


var Random = require('./random.js'); 

var bodyParser = require('body-parser'); 
var cookieParser = require('cookie-parser'); 

var fs = require('fs'); 

var redis = require('redis').createClient(); 

var mysql      = require('mysql');
	var connection = mysql.createConnection({
	  host     : 'localhost',
	  database : 'superstock', 
	  user     : 'root',
	  password : ''
	});

try {
	connection.connect();
} catch(e){
	console.log('Problems with MySQL connection', e); 
}


var toString = function(data){
	return data.toString('utf8', 0, data.len); 
}

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser()); 

// Register '.mustache' extension with The Mustache Express
app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');


app.disable('x-powered-by');

app.use(function(req, res, next){
	var cookie = req.cookies.superstock; 

	if( ! cookie ){
		res.cookie('superstock', Random(), { expires: new Date(Date.now() + 60 * 60 * 1000)});
		req.session_data = {}; 
		req.session_data.auth = false; 
		req.session_data.username = null; 
		return next(); 
	}
	
	var authToken = authToken = 'session:'+ cookie; 
	redis.get(authToken, function(err, reply){
		if( err ) return res.send('error'); 
		  	
  	try{
  		var session = JSON.parse(reply); 
  	} catch(e){

  	}
  	
  	if( session ){
  	
			req.session_data = session; 
			req.session_data.auth = true; 
			
  	} else {
  		  	
			req.session_data = {}; 
			req.session_data.auth = false; 
  	}
  	next(); 
	});
	
  
});

home.use(function(req, res, next){
  var cookie = req.cookies.superstock; 
  if( ! cookie ) return res.redirect('/login'); 
  var authToken = 'session:'+ cookie; 
  redis.get(authToken, function(err, reply){
  	if( err ) return res.send('db error');   
  	
  	if( ! reply ) return res.redirect('/login'); 
 	
 	var session = null; 
  	
  	try{
  		session = JSON.parse(reply); 
  	} catch(e){

  	}

  	if( ! session.email ) return res.redirect('/login'); 

  	next(); 
  }); 

});

home.get('/', function(req,res){
	res.send('wellcome home'); 
});

app.use('/home', home); 

app.get('/', function(req, res){
	var session = req.session_data || {}; 
  res.render('index', {
  	Auth: session.auth,
  	username: session.username
  }); 
});

app.get('/login', function(req, res){
	var key = req.cookies.superstock;   

	if( ! key ) return res.send('login form'); 

	redis.get("session:" + key, function(err,reply){
		if( err ) throw err; 

		if( ! reply ) return res.send('login form'); 
		
		var data = null; 
		
		try {
			data = JSON.parse(reply);  			
		} catch(e){
			return res.send(e); 
		}
		
		if( data.error ) return res.send(data.error); 

		return res.send('nothing here '); 

	}); 

	

}); 

app.post('/login', function(req,res){
	if( ! req.body ) return res.redirect('/login');  
	
	connection.query('SELECT * FROM users WHERE email = ? AND password = ?', 
		[req.body.email, req.body.password], function(err, rows, fields) {

	  	if (err) throw err;
		
		var user = (rows.length) ? rows[0] : null; 

		if( ! user ) {
			var session = req.cookies.superstock; 
			if( session ){
				redis.setex("session:" + session, 60 * 60, JSON.stringify({
					'form': req.body,
					'error': 'invalid login or password'
				})); 
			}
			return res.send('invalid login/password'); 
		}

		var cookie = req.cookies.superstock ? req.cookies.superstock : Random(); 
		var authToken = 'session:' + cookie; 
		var days = (req.body.remember) ? 7 : 1; 
		var expire = days * 24 * 60 * 60; 

		redis.setex(authToken, expire, JSON.stringify(user)); 
		res.cookie('superstock', cookie, { expires: new Date(Date.now() + expire * 1000)});

		res.redirect('/home'); 
	});
}); 

app.get('/cookie', function(req,res){
	res.cookie('superstock', 'abc', { expires: new Date(Date.now() + 24 * 60 * 60 * 1000)});
	res.send('set cookie'); 
}); 

app.get('/random', function(req,res){
	res.send(Random()); 
})

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0"); 