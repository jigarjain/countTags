var bodyParser = require('body-parser');
    express    = require('express'),
    config     = require('./config'),
    mongojs    = require('mongojs'),
    _          = require('lodash'),
    app        = express();

var dependencies = {
    db : mongojs(config.mongo)
};

// Initiliaze Utils
require('./util')(dependencies).init(app, function (err) {
    if (err) {
        throw err;
    }

    // Handlebar templating engine used
    app.engine('hb', require('handlebars').compile);


    // Parse POST data
    app.use(bodyParser.urlencoded({
        extended: true
    }));


    // Routes defined here
    var handlers = [
        {
            'mount': '/',
            'file' : __dirname + '/handlers/home.js'
        }
    ];

    _.each(handlers, function (h) {
        app.use(h.mount, require(h.file)(dependencies));
    });

    // listen on port
    app.listen(3000);
});
