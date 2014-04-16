'use strict';

var eachAsync = require('each-async');
var fs = require('fs-extra');
var mode = require('stat-mode');
var path = require('path');
var Ware = require('ware');

/**
 * Initialize Imagemin
 *
 * @api public
 */

function Imagemin() {
    this.ware = new Ware();
}

/**
 * Add a plugin to the middleware stack
 *
 * @param {Function} plugin
 * @api public
 */

Imagemin.prototype.use = function (plugin) {
    this.ware.use(plugin);
    return this;
};

/**
 * Get or set the source files
 *
 * @param {String|Array} files
 * @api public
 */

Imagemin.prototype.source = function (files) {
    if (!arguments.length) {
        return this._src;
    }

    this._src = Array.isArray(files) ? files : [files];
    return this;
};

/**
 * Get or set the destination directory
 *
 * @param {String} path
 * @api public
 */

Imagemin.prototype.destination = function (path) {
    if (!arguments.length) {
        return this._dest;
    }

    this._dest = path;
    return this;
};

/**
 * Optimize files
 *
 * @param {Function} cb
 * @api public
 */

Imagemin.prototype.optimize = function (cb) {
    cb = cb || function () {};
    var self = this;

    this.read(function (err, files) {
        self.run(files, function (err, files) {
            if (err) {
                return cb(err);
            }

            self.write(files, function (err) {
                cb(err, files);
            });
        });
    });
};

/**
 * Run an array of files through the middleware
 *
 * @param {Array} files
 * @param {Function} cb
 * @api public
 */

Imagemin.prototype.run = function (files, cb) {
    this.ware.run(files, this, cb);
};

/**
 * Read the source files
 *
 * @param {Function} cb
 * @api public
 */

Imagemin.prototype.read = function (cb) {
    var files = {};
    var src = this.source();

    eachAsync(src, function (file, i, done) {
        var name = path.relative(process.cwd(), file);

        fs.stat(file, function (err, stats) {
            if (err) {
                return done(err);
            }

            fs.readFile(file, function (err, buf) {
                var file = {};

                if (err) {
                    return done(err);
                }

                file.contents = buf;
                file.mode = mode(stats).toOctal();
                file.origSize = buf.length;
                files[name] = file;

                done();
            });
        });
    }, function (err) {
        cb(err, files);
    });
};

/**
 * Write `files` to destination
 *
 * @param {Object} files
 * @param {Function} cb
 * @api public
 */

Imagemin.prototype.write = function (files, cb) {
    var dest = this.destination();

    eachAsync(Object.keys(files), function (file, i, done) {
        var data = files[file].contents;
        var out = path.join(dest, path.basename(file));

        files[file].destSize = data.length;

        fs.outputFile(out, data, function (err) {
            done(err);
        });
    }, function (err) {
        cb(err);
    });
};

/**
 * Module exports
 */

module.exports = Imagemin;
module.exports.gifsicle = require('./plugins/gifsicle');
module.exports.jpegtran = require('./plugins/jpegtran');
module.exports.optipng = require('./plugins/optipng');
module.exports.pngquant = require('./plugins/pngquant');
