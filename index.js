var bodyParser = require('body-parser'),
    express    = require('express'),
    config     = require('./config'),
    mongojs    = require('mongojs'),
    _          = require('lodash'),
    app        = express();

var dependencies = {
    db : mongojs(config.mongo),
    cfg : config
};

// Initiliaze Utils
require('./util')(dependencies).init(app, function (err) {
    if (err) {
        throw err;
    }

    // Parse POST data
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Static files
    app.use(config.baseurl + '/statics', express.static(config.paths.static));


    // Routes defined here
    var handlers = [
        {
            'mount': config.baseurl + '/',
            'file' : __dirname + '/handlers/home.js'
        }
    ];

    _.each(handlers, function (h) {
        app.use(h.mount, require(h.file)(dependencies));
    });


    // listen on port from config
    app.listen(config.server.port);
});
