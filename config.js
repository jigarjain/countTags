module.exports = {
    'env' : 'development',
    'baseurl' : '',
    'mainurl' : 'http://54.191.205.94',
    'mongo' : {
        'db' : 'countTags'
    },
    'paths' : {
        'static' : __dirname + '/statics',
        'layout' : __dirname + '/views/layout'
    },
    'server' : {
        'port' : 3000
    }
};
