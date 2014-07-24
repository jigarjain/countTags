module.exports = function () {
    var _       = require('lodash'),
        async   = require("async"),
        cheerio = require("cheerio"),
        fs      = require('fs'),
        request = require("request");

    var tags = [];

    // Read the tags.json file
    fs.readFile(__dirname +'/tags.json', 'utf8', function (err, data) {
        if (err) {
            throw new Error('tags file not found');
        }
        tags = JSON.parse(data);
    });

    function parse(url, cb) {
        request({
          uri: url,
        }, function(error, response, body) {
            if(error) {
                return cb(error);
            }

            var $ = cheerio.load(body);
            async.map(tags, function(tag, callback) {
                var item = {
                    'tag': tag.name,
                    'html5': tag.html5,
                    'count': $(tag.name).length
                };
                callback(null, item);
            }, function(err, results){
                cb(err, results);
            });
        });
    }

    return {
        'parse': parse
    };
};
