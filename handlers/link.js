module.exports = function (deps) {
    var countTags = require('../lib/countTags')(),
        express   = require('express'),
        router    = express.Router();


    /**
     * Looks for Get request
     */
    router.get('/', function (req, res) {

        var opts = {
            'title': 'Home'
        };

        var pageData = {
            'heading' : 'This is heading'
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

        if(url) {
            countTags.parse(url, function (err, data){
            if(err) {
                throw err;
            }

            var opts = {
                'title': 'Results'
            };

            var pageData = {
                'url': url,
                'tagCount': data
            };

            var file= 'result.tmpl';

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
        } else {
            res.send('No Url');
        }

    });

    return router;
};
