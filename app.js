var express = require('express'),
	app = express(),
	home = express(); 

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
home.use(cookieParser()); 

app.disable('x-powered-by');

home.use(function(req, res, next){
  var cookie = req.cookies.superstock; 
  if( ! cookie ) return res.redirect('/login'); 
  var authToken = 'session:'+cookie; 
  redis.get(authToken, function(err, reply){
  	if( err ) return res.send('db error');   
  	
  	if( ! reply ) return res.redirect('/login'); 
    console.log(reply); 
  	next(); 
  }); 

});

home.get('/', function(req,res){
	res.send('wellcome home'); 
});

app.use('/home', home); 

app.get('/', function(req, res){
	
	fs.readFile('index.htm', function(err,data){
		if( err ) return res.send(err); 

		res.send(toString(data));  

	}); 

});

app.get('/login', function(req, res){
	var email = res.get('Superstock-Form-Data'); 
	if( email ) res.send(email); 
	res.send('login form'); 
}); 

app.post('/login', function(req,res){
	if( ! req.body ) return res.redirect('/login');  
	
	connection.query('SELECT * FROM users WHERE email = ? AND password = ?', 
		[req.body.email, req.body.password], function(err, rows, fields) {

	  	if (err) throw err;
		
		var user = (rows.length) ? rows[0] : null; 

		if( ! user ) {
			return res.send('invalid login/password'); 
		}
		var cookie = Random(); 
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

app.listen(8080);