var bodyParser = require('body-parser'),
    config     = require('./config'),
    compress   = require('compression'),
    express    = require('express'),
    exphbs     = require('express-handlebars'),
    _          = require('lodash'),
    mongojs    = require('mongojs'),
    app        = express();


// Set Dependencies
var dependencies = {
    db : mongojs(config.mongo.db),
    cfg : config
};


// Parse POST data through bodyParser
app.use(bodyParser.urlencoded({
    extended: true
}));


// Use gzip compression
app.use(compress());


// Static files Serve Directly
app.use(config.baseurl + '/statics', express.static(config.paths.static));


// Setting local variables
app.use(function(req, res, next){
    res.locals.baseurl = dependencies.cfg.baseurl;
    res.locals.version = require('./package.json').version;
    next();
});


// Create Express handlebar instance
var hbs = exphbs.create({
    layoutsDir    :  config.paths.layout,
    defaultLayout : 'master',
    extname       : '.hbs'
});


// Initialize engine
app.engine('.hbs', hbs.engine);


// Set engine
app.set('view engine', '.hbs');


// Declare Mounting Points
var handlers = [
    {
        'mount': config.baseurl + '/',
        'file' : __dirname + '/handlers/home.js'
    }
];


// Create use for each Mounting point
_.each(handlers, function (h) {
    app.use(h.mount, require(h.file)(dependencies));
});


// listen on port from config
app.listen(config.server.port);
console.log('Listening on port: ' + config.server.port);
