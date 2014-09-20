 module.exports = function (deps) {
    var _          = require('lodash'),
        shortId    = require('shortid'),
        coll       = deps.db.collection('links');

    function Link() {
        this._id = null;
        this.createTime = null;
        this.updateTime = null;
        this.parseUrl = null;
        this.slug = null;
        this.parsedHtml = [];
        this.parsedCss = [];
    }

    Link.prototype = {
        'touch': function () {
            this.updateTime = _.now();

            if (!this.createTime) {
                this.createTime = _.now();
            }
        }
    };


    function Repo() {}
    Repo.add = function (link) {
        return this.getByUrl(link.parseUrl)
            .then(function (fetched) {
                return new Promise(function (resolve, reject) {
                    if (fetched) {
                        delete link._id;
                        link.slug = fetched.slug;

                        coll.update(
                            {parseUrl  : link.parseUrl},
                            {$set : link},
                            function (err, doc) {
                                if (err) {
                                    reject(err);
                                }

                                link._id = doc._id;
                                resolve(link._id);
                        });
                    } else {
                        link.touch();
                        // Proceed with insert
                        link.slug = shortId.generate();
                        coll.insert(link, function (err, doc) {
                            if (err) {
                                reject(err);
                            }

                            link._id = doc._id;
                            resolve(link._id);
                        });
                    }
                });
            });
    };



    Repo.getByUrl = function (parseUrl) {
        return new Promise(function (resolve, reject) {
            coll.findOne({
                'parseUrl': parseUrl
            }, function (err, doc) {
                if (err) {
                    reject(err);
                }

                resolve(doc ? _.create(new Link(), doc) : null);
            });
        });
    };


    Repo.getBySlug = function (slug) {
        return new Promise(function (resolve, reject) {
            coll.findOne({
                'slug': slug
            }, function (err, doc) {
                if (err) {
                    reject(err, null);
                }

                resolve(doc ? _.create(new Link(), doc) : null);
            });
        });
    };

    return {
        'Link' : Link,
        'Repo' : Repo
    };
};
