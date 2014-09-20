module.exports = function (deps) {
    var wrap       = require('co-express'),
        express    = require('express'),
        _          = require('lodash'),
        validator  = require('validator'),
        countTags  = require('../lib/countTags')(),
        links      = require('../models/links')(deps),
        router     = express.Router();


    /**
     * Serves HomePage on GET request
     */
    router.get('/', function (req, res) {
        var pageData = {
            'title': 'Parse my page'
        };

        res.render('index', pageData);
    });

    /**
     * Looks for POST request (URL submission)
     */
    router.post('/', wrap(function* (req, res, next) {
        try {
            var op = null;

            if (!validator.isURL(req.body.url, {'require_protocol': true})) {
                op = {
                    code: 0,
                    msg: 'URL is not valid'
                };
                res.send(op);
                return;
            }

            var link = new links.Link();
            link.parseUrl = req.body.url;
            var result = yield countTags.parse(link.parseUrl);
            link.parsedHtml = result[0];
            link.parsedCss = result[1];
            yield links.Repo.add(link);

            op = {
                code: 1,
                url: link.slug
            };
            res.send(op);
        } catch(e) {
            next(e);
        }
    }));

    /**
     * Looks for GET request (Result Page)
     */
    router.get('/:slug', wrap(function* (req, res, next) {
        try {
            var link = yield links.Repo.getBySlug(req.params.slug);

            if (!link) {
                return next();
            }

            var pageData = {
                'link': link,
                'title': 'CountTags',
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

            _.each(pageData.link.parsedHtml, function(item) {
                item.classes = item.classes.join(', ');
                item.ids = item.ids.join(', ');
            });

            res.render('result', pageData);
        } catch(e) {
            next(e);
        }
    }));

    return router;
};
