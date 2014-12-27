var mysql      = require('mysql');
    
module.exports = function(config){
    
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
    
    return connection; 
    
}

