module.exports = {
    'env' : 'development',
    'baseurl' : process.BASEURL || 'http://jigarjain.com/apps/countTags',
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
