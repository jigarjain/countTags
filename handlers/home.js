module.exports = function (deps) {
    var countTags = require('../lib/countTags')(),
        express   = require('express'),
        router    = express.Router(),
        shortId   = require('shortid');

    var collection = deps.db.collection('links');


    /**
     * Looks for Get request
     */
    router.get('/', function (req, res) {

        var opts = {
            'title': 'Count Tags',
            'baseurl': deps.cfg.baseurl
        };

        var file = 'index.tmpl';

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
    });

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
                        'shortLink': shortId.generate(),
                        'tagCount': data
                    };

                    collection.insert(dbData, function (err, doc) {
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
        } else {
            op = {
                code: 0,
                msg: 'No Url specified'
            };

            res.send(op);
        }
    });

    router.get('/:shortLink', function(req, res) {
        var shortLink = req.params.shortLink;

        collection.findOne({
            shortLink: shortLink
        }, function (err, doc) {
            if(err || doc === null) {
                res.send('404');
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

                var pageData = doc;
                pageData.shareLink = deps.cfg.baseurl + '/' + doc.shortLink;

                var file = 'result.tmpl';

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
