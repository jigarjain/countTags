module.exports = function () {
    var async   = require("async"),
        cheerio = require("cheerio"),
        fs      = require('fs'),
        _       = require('lodash'),
        request = require("request");
        tags    = [];

    // Read the tags.json file
    fs.readFile(__dirname +'/tags.json', 'utf8', function (err, data) {
        if (err) {
            throw new Error('Tags file not found');
        }
        tags = JSON.parse(data);
    });

    /**
     * Takes a URL, parses it & calculates the occurence of each HTML Tag
     *
     * @param  {String}   url URL to parse
     * @param  {Function} cb  Callback to call once URL is parsed
     *
     * @return {Callback}     Callback will be called with error if any or the
     *                        Array of count of occurence of each HTML Tag
     */
    function parse(url, cb) {

        var output = {
            'tags': [],
            'ids': [],
            'classes': []
        };

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
                    'count': $(tag.name).length,
                    'classes': [],
                    'ids': []
                };

                // For each occurence of a tag, get their Classes & Ids
                $(tag.name).each(function() {
                    var tempClasses = $(this).attr('class');
                    var tempIds = $(this).attr('id');

                    if(tempClasses) {
                        tempClasses = tempClasses.split(" ");
                        item.classes = item.classes.concat(tempClasses);
                    }

                    if(tempIds) {
                        tempIds = tempIds.split(" ");
                        item.ids = item.ids.concat(tempIds);
                    }
                });

                // Remove Duplicates
                item.classes = _.uniq(item.classes);
                item.ids = _.uniq(item.ids);

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
