module.exports = function () {
    var _       = require('lodash'),
        async   = require("async"),
        cheerio = require("cheerio"),
        request = require("request");


    var tags = ['a',
                'abbr',
                'address',
                'area',
                'article',
                'aside',
                'audio',
                'b',
                'base',
                'bdi',
                'bdo',
                'blockquote',
                'body',
                'br',
                'button',
                'canvas',
                'caption',
                'cite',
                'code',
                'col',
                'colgroup',
                'data',
                'datalist',
                'dd',
                'del',
                'details',
                'dfn',
                'dialog',
                'div',
                'dl',
                'dt',
                'em',
                'embed',
                'fieldset',
                'figcaptio',
                'figure',
                'footer',
                'form',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'head',
                'header',
                'hgroup',
                'hr',
                'html',
                'i',
                'iframe',
                'img',
                'input',
                'ins',
                'kbd',
                'keygen',
                'label',
                'legend',
                'li',
                'link',
                'main',
                'map',
                'mark',
                'menu',
                'menuitem',
                'meta',
                'meter',
                'nav',
                'noscript',
                'object',
                'ol',
                'optgroup',
                'option',
                'output',
                'p',
                'param',
                'pre',
                'progress',
                'q',
                'rb',
                'rp',
                'rt',
                'rtc',
                'ruby',
                's',
                'samp',
                'script',
                'section',
                'select',
                'small',
                'source',
                'span',
                'strong',
                'style',
                'sub',
                'summary',
                'sup',
                'table',
                'tbody',
                'td',
                'template',
                'textarea',
                'tfoot',
                'th',
                'thead',
                'time',
                'title',
                'tr',
                'track',
                'u',
                'ul',
                'var',
                'video',
                'wbr'
  ];

    function parse(url, cb1) {
        console.log('#Req Sent ', _.now());
        request({
          uri: url,
        }, function(error, response, body) {
            console.log('#Res Received ', _.now());
            if(error) {
                return cb1(error);
            }
            var $ = cheerio.load(body);
            console.log('#Body Loaded ', _.now());

            async.map(tags, function(tag, callback) {
                var item = {
                    'tag': tag,
                    'count': $(tag).length
                };
                callback(null, item);
            }, function(err, results){
                console.log('#Calculated ', _.now());
                cb1(err, results);
            });
        });
    }

    return {
        'parse': parse
    };
};
