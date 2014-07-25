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
            },
            {
                'name': '_tag',
                'path': __dirname + '/views/templates/_tag.tmpl'
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

    function objToKeyval(obj) {
        return _.collect(obj, function (val, key) {
            return {'key': key, 'val': val};
        });
    }

    function renderCSSTags(csstags) {
        var out = '';

        if (typeof csstags === 'string') {
            out = out + templates._tag({
                'name': 'link',
                'opts': objToKeyval({
                    'rel': 'stylesheet',
                    'href': csstags
                }),
                'selfclose': true
            });
        } else {
            _.each(csstags, function (css) {
                if (typeof css === 'string') {
                    out = out + templates._tag({
                        'name': 'link',
                        'opts': objToKeyval({
                            'rel': 'stylesheet',
                            'href': css
                        }),
                        'selfclose': true
                    });
                } else {
                    out = out + templates._tag({
                        'name': 'link',
                        'opts': objToKeyval(css),
                        'selfclose': true
                    });
                }
            });
        }

        return out;
    }

    function renderJSTags(jstags) {
        var out = '';

        if (typeof jstags === 'string') {
            out = out + templates._tag({
                'name': 'script',
                'opts': objToKeyval({
                    'type': 'text/javascript',
                    'src': jstags
                })
            });
        } else {
            _.each(jstags, function (js) {
                if (typeof js === 'string') {
                    out = out + templates._tag({
                        'name': 'script',
                        'opts': objToKeyval({
                            'type': 'text/javascript',
                            'src': js
                        })
                    });
                } else {
                    out = out + templates._tag({
                        'name': 'script',
                        'opts': objToKeyval(js)
                    });
                }
            });
        }

        return out;
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

                var data = {};

                // content
                data.content = content;

                // title
                data.title       = ('title' in opts ? opts.title + ' | ' : '') + 'CountTags';

                // css
                if ('css' in opts) {
                    data.css = renderCSSTags(opts.css);
                }

                // js
                if ('js' in opts) {
                    data.js = renderJSTags(opts.js);
                }

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
        'notfound': function () {
            _res.status(404);
            var opt = {
                'title': 'You lost bro?',
            };

            var file = 'templates/_404.tmpl';

            deps.util.layout.subcontent(file, {})
                .then(function(subcontent){
                    return deps.util.layout.master(subcontent, opts)
                        .then(function (output) {
                            res.send(output);
                        });
                });
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
