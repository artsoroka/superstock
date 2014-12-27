var MainpageController = {
    index: function(req,res){
        var unknownUser = {
            Auth: false, 
            username: null
        }; 
        
        if( ! req.session.auth ) return res.render('superstock/mainpage', unknownUser); 
        res.render('superstock/mainpage', {
            Auth: true,
            username: req.session.user.username 
        }); 
    }
}

module.exports = MainpageController; 