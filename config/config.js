module.exports = {
    App: {
        port: process.env.PORT || 3000, 
        host: process.env.IP || "0.0.0.0"
    }, 
    MySQL: {
      host     : 'localhost',
	  database : 'superstock', 
	  user     : 'root',
	  password : ''
    }
}