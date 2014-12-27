module.exports = function(app){
    var mainpage = app.controllers.mainpage; 
    
    app.get('/', mainpage.index);
    
    app.get('/signup', function(req,res){
        res.render('signup'); 
    }); 

    app.get('/login', function(req,res){
        var errMessage = req.session.error; 
        res.render('login', {
            Error: errMessage, 
        }); 
        req.session.error = null; 
    }); 
    
    app.post('/login', function(req, res){
    	if( ! req.body ) return res.redirect('/login');  
    	
    	app.mysql.query('SELECT * FROM users WHERE email = ? AND password = ?', 
    		[req.body.email, req.body.password], function(err, rows, fields) {
    
    	  	if (err) throw err;
    		
    		var user = (rows.length) ? rows[0] : null; 
    
    		if( ! user ) {
    		    req.session.error = 'Invalid login or password ';  
    		    return res.redirect('/login'); 
    		}
            req.session.auth = true; 
            req.session.user = user; 

    		res.redirect('/home'); 
    	});
    }); 
    
    app.get('/home', function(req, res){
        if( ! req.session.auth ) return res.redirect('/login');  
        res.send('home');  
    }); 
    
}