var express = require('express');
var app = express(); 
var bodyParser = require('body-parser'); 
var cookieParser = require('cookie-parser');  

// Config =========================================================
var config = require('./config/config.js'); 
app.mysql = require('./config/mysql.js')(config.MySQL); 
app.redis = require('redis').createClient(); 

// Middleware =====================================================
var mustacheExpress = require('mustache-express');

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(cookieParser()); 

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

// Sessions ======================================================= 
require('./config/session.js')(app); 

// Controllers ====================================================
app.controllers = {}; 
app.controllers.mainpage = require('./controllers/MainpageController.js'); 

// Routes =========================================================
require('./config/routes.js')(app); 

app.disable('x-powered-by');

app.listen(config.App.port, config.App.host);  

console.log('app is started on ', config.App.port, config.App.host); 