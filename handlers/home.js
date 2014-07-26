module.exports = function (deps) {
    var countTags  = require('../lib/countTags')(),
        express    = require('express'),
        shortId    = require('shortid'),
        router     = express.Router(),
        collection = deps.db.collection(' ');


    /**
     * Serves HomePage on GET request
     */
    router.get('/', function (req, res) {
        var opts = {
            'title': 'Count Tags',
            'baseurl': deps.cfg.baseurl
        };

        var file = 'index.tmpl';

        deps.util.layout.subcontent(file, {})
            .then(function(subcontent){
                return deps.util.layout.master(subcontent, opts)
                    .then(function (output) {
                        res.send(output);
                    });

            })
            .catch(function (err) {
                res.send(err);
            });
    });

    /**
     * Looks for POST request (URL submission)
     */
    router.post('/', function (req, res) {
        var url = req.body.url;
        var op = {};
        if(url) {
            countTags.parse(url, function (err, data) {
                if(err) {
                    op = {
                        code: 0,
                        msg: 'Something went wrong'
                    };
                    res.send(op);
                } else {
                    var dbData = {
                        'url': url,
                        'tagCount': data
                    };

                    collection.findOne({
                        url: dbData.url
                    }, function(err, doc) {

                        if(err) {
                            throw err;
                        }

                        if(doc !== null) {
                            // Same URL already exist. Hence Update
                            collection.update(
                                {url  : dbData.url},
                                {$set : dbData},
                                function (err, uDoc) {
                                    if(err) {
                                        op = {
                                            code: 0,
                                            msg: 'Something went wrong'
                                        };
                                    } else {
                                        op = {
                                            code: 1,
                                            url: doc.shortLink
                                        };
                                    }
                                    res.send(op);
                            });
                        } else {
                            // New URL, So Insert
                            dbData.shortLink = shortId.generate();
                            collection.insert(
                                dbData,
                                function (err, iDoc) {
                                    if(err) {
                                        op = {
                                            code: 0,
                                            msg: 'Something went wrong'
                                        };
                                    } else {
                                        op = {
                                            code: 1,
                                            url: dbData.shortLink
                                        };
                                    }
                                    res.send(op);
                            });
                        }
                    });
                }
            });
        } else {
            op = {
                code: 0,
                msg: 'No Url specified'
            };
            res.send(op);
        }
    });

    /**
     * Looks for GET request (Result Page)
     */
    router.get('/:shortLink', function(req, res) {
        var shortLink = req.params.shortLink;
        var file      = null;

        collection.findOne({
            shortLink: shortLink
        }, function (err, doc) {
            if(err || doc === null) {
                var opt = {
                    'title': 'You lost bro?',
                };
                file    = 'templates/_404.tmpl';

                res.status(404);

                deps.util.layout.subcontent(file, {})
                    .then(function(subcontent){
                        return deps.util.layout.master(subcontent, opts)
                            .then(function (output) {
                                res.send(output);
                            });
                    })
                    .catch(function (err) {
                        res.send(err);
                    });

            } else {
                var opts = {
                    'title': 'CountTags',
                    'baseurl': deps.cfg.baseurl,
                    'js': [
                        deps.cfg.baseurl + '/statics/thirdparty/footable/js/footable.js',
                        deps.cfg.baseurl + '/statics/thirdparty/footable/js/footable.sortable.js',
                        deps.cfg.baseurl + '/statics/thirdparty/footable/js/footable.paginate.js',
                        deps.cfg.baseurl + '/statics/thirdparty/footable/js/footable.filter.js',
                    ],
                    'css' : [
                        deps.cfg.baseurl + '/statics/thirdparty/footable/css/footable.sortable-0.1.css',
                    ]
                };

                var pageData       = doc;
                pageData.shareLink = deps.cfg.baseurl + '/' + doc.shortLink;
                file               = 'result.tmpl';

                deps.util.layout.subcontent(file, pageData)
                    .then(function(subcontent){
                        return deps.util.layout.master(subcontent, opts)
                            .then(function (output) {
                                res.send(output);
                            });
                    })
                    .catch(function (err) {
                        res.send(err);
                    });
            }
        });
    });

    return router;
};
