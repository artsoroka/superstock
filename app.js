var express = require('express');
var app = express();
var fs = require('fs'); 

var toString = function(data){
	return data.toString('utf8', 0, data.len); 
}

app.use(express.static(__dirname));

app.get('/', function(req, res){
	
	fs.readFile('index.htm', function(err,data){
		if( err ) return res.send(err); 

		res.send(toString(data));  

	}); 

});

app.listen(8080);