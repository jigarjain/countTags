module.exports = function (deps) {
    var handlebars = require('handlebars'),
        async      = require('async'),
        fs         = require('fs'),
        _          = require('lodash'),
        templates  = {},
        _req, _res;

    function precompile(callback) {
        var sources = [
            {
                'name': 'master',
                'path': __dirname + '/views/templates/master.tmpl'
            }
        ];

        async.each(sources, function (tmpl, callback) {
            fs.readFile(tmpl.path, 'utf-8', function(err, data) {
                if (err) {
                    callback(err);
                } else {
                    templates[tmpl.name] = handlebars.compile(data);

                    callback();
                }
            });
        }, callback);
    }

    var layout = {
        /**
         * Render Master Layout by give data
         *
         * @param  {String} content Sub-content in string format
         * @param  {Object} opts    Optional data like CSS, JS, Meta
         *
         * @return {Promise}        Final HTML content to be displayed
         */
        'master': function (content, opts) {

            return new Promise(function (resolve, reject) {
                if (!opts) {
                    opts = {};
                }

                var data = {
                    'css'      : '',
                    'js'       : ''
                };

                // content
                data.content = content;

                // title
                data.title       = ('title' in opts ? opts.title + ' | ' : '') + 'CountTags';

                // description
                data.description = 'description' in opts ? opts.description : '';

                // render
                resolve(templates.master(data));
            });
        },

        /**
         * Renders Sub Content layout
         *
         * @param  {String} file Template file which needs to be rendered
         * @param  {Array}  data Array of content that needs to be passed
         *
         * @return {Promise}     String of the rendered Sub content
         */
        'subcontent' : function (file, data) {
            return new Promise(function (resolve, reject) {
                fs.readFile(__dirname + '/views/'+ file, 'utf-8', function (err, fileContents) {
                    if (err) {
                        reject(err);
                    }

                    var tmpl = handlebars.compile(fileContents);
                    resolve(tmpl(data));
                });
            });
        }
    };

    var response = {
        'error': function (err) {
            _res.status(500);
            _res.send(layout.master('500 Error', {
                'title': 'Error'
            }));
        },

        'forbidden': function (err) {
            _res.status(403);
            _res.send(layout.master('403 Error', {
                'title': 'Forbidden'
            }));
        },

        'notfound': function () {
            _res.status(404);
            _res.send(layout.master('404 Error', {
                'title': 'Not found'
            }));
        }
    };

    function init(app, callback) {
        precompile(function (err) {
            if (err) {
                callback(err);
            }

            app.use(function (req, res, next) {
                _req = req;
                _res = res;
                next();
            });

            deps.util = {
                'layout'  : layout,
                'response': response
            };

            callback(null);
        });
    }

    return {'init': init};
};
