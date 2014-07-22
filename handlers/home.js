module.exports = function (deps) {
    var express = require('express'),
        router  = express.Router();

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
        res.send(req.body);
    });

    return router;
};
