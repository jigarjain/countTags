module.exports = {
    'env'         : 'development',
    'mongo'       : 'countTags',
    'session': {
        'secret': 'countTags220714',
        'mongo' : 'sess_countTags'
    },
    'paths': {
        'static': __dirname + '/statics'
    },
    'server': {
        'port': 3000
    }
};
