module.exports = function () {
    var async   = require('async'),
        cheerio = require('cheerio'),
        css     = require('css'),
        fs      = require('fs'),
        _       = require('lodash'),
        request = require('request'),
        tags    = [];

    var cssProps = ['color', 'font-size', 'font-family'];

    // Read the tags.json file
    fs.readFile(__dirname +'/tags.json', 'utf8', function (err, data) {
        if (err) {
            throw new Error('Tags file not found');
        }
        tags = JSON.parse(data);
    });

    function parse(url) {
        return getRemoteFileContent(url)
            .then(function (responseBody) {
                return Promise.all([
                    parseHtml(responseBody.body),
                    parseCSS(responseBody.body)
                ]);
            });
    }

    function parseHtml(body) {
        return new Promise(function(resolve, reject) {
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
                        tempClasses = tempClasses.split(' ');
                        item.classes = item.classes.concat(tempClasses);
                    }

                    if(tempIds) {
                        tempIds = tempIds.split(' ');
                        item.ids = item.ids.concat(tempIds);
                    }
                });

                // Remove Duplicates
                item.classes = _.uniq(item.classes);
                item.ids = _.uniq(item.ids);

                callback(null, item);
            }, function(err, results){
                if (err) {
                    return reject(err);
                }

                resolve(results);
            });
        });
    }

    function parseCSS(body) {
        return new Promise(function (resolve, reject) {
            var $ = cheerio.load(body);
            var cssPaths = [];
            $('link[rel="stylesheet"]').each(function () {
                var url = $(this).attr('href');
                if(url.indexOf('http') !== -1) {
                    cssPaths.push(url);
                }
            });

            var readCssTask = [];
            _.each(cssPaths, function (path) {
                readCssTask.push(getRemoteFileContent(path));
            });

            return Promise.all(readCssTask)
                .then(function (cssContent) {
                    var extractPropsTasks = _.map(cssPaths, function(path, index) {
                        return extractProperties(path, cssContent[index].body);
                    });

                    return Promise.all(extractPropsTasks);
                })
                .then(function (results) {
                    resolve(results);
                })
                .catch(function(error) {
                    reject(error);
                });
        });
    }

    function getRemoteFileContent(url) {
        return new Promise(function (resolve, reject) {
            request({
              uri: url,
            }, function(err, response, body) {
                if(err) {
                    return reject(err);
                }

                resolve({
                    'response': response,
                    'body': body
                });
            });
        });
    }

    function extractProperties(path, content) {
        return new Promise(function (resolve) {
            var pathProps = {
                'path': path,
                'props': {}
            };

            _.each(cssProps, function (item) {
                pathProps.props[item] = [];
            });

            var ast = css.parse(content, {source: path});
            _.each(ast.stylesheet.rules, function (rule) {
                _.each(rule.declarations, function (dec) {
                    if (cssProps.indexOf(dec.property) !== -1) {
                        pathProps.props[dec.property].push(dec.value);
                    }
                });
            });

            _.each(pathProps.props, function (item, key) {
                pathProps.props[key] = _.uniq(item);
            });

            resolve(pathProps);
        });
    }


    return {
        'parse': parse
    };
};
