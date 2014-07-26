var bodyParser = require('body-parser'),
    config     = require('./config'),
    express    = require('express'),
    _          = require('lodash'),
    mongojs    = require('mongojs'),
    app        = express();


// Set Dependencies
var dependencies = {
    db : mongojs(config.mongo.db),
    cfg : config
};


// Initiliaze Utils Function
require('./util')(dependencies).init(app, function (err) {
    if (err) {
        throw err;
    }


    // Parse POST data through bodyParser
    app.use(bodyParser.urlencoded({
        extended: true
    }));


    // Static files Serve Directly
    app.use(config.baseurl + '/statics', express.static(config.paths.static));


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
});
