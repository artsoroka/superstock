var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var hour = 1200; 

module.exports = function(app){
    app.use(session({
            name: 'superstock', 
            key: 'superstock', 
            cookie: {
                httpOnly: false, 
                secure: false
            },
            store: new RedisStore({
            client: app.redis, 
            ttl: 24 * hour,
            resave: false 
        }),
        secret: 'keyboard cat'
    }));
}