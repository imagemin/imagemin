'use strict';

var cache = require('cache-file');
var endsWith = require('mout/string/endsWith');
var filesize = require('filesize');
var find = require('mout/array/find');
var fs = require('fs');
var isFunction = require('mout/lang/isFunction');
var mkdir = require('mkdirp');
var path = require('path');
var spawn = require('child_process').spawn;

/**
 * Initialize `Imagemin` with options
 *
 * @param {String} src
 * @param {String} dest
 * @param {Object} opts
 * @api private
 */

function Imagemin(src, dest, opts) {
    opts = opts || {};
    this.opts = opts;
    this.src = src;
    this.dest = dest;
    this.optimizers = {
        '.gif': this._optimizeGif,
        '.jpg': this._optimizeJpeg,
        '.jpeg': this._optimizeJpeg,
        '.png': this._optimizePng
    };
    this.optimizerTypes = Object.keys(this.optimizers);
    this.optimizer = this._getOptimizer(this.src);
}

/**
 * Optimize GIF, JPEG, and PNG images
 *
 * @param {Function} cb
 * @api public
 */

Imagemin.prototype.optimize = function (cb) {
    if (!cb || !isFunction(cb)) {
        cb = function () {};
    }

    if (!fs.existsSync(path.dirname(this.dest))) {
        mkdir.sync(path.dirname(this.dest));
    }

    if (this.opts.cache && cache.check(this.src)) {
        cache.get(this.src, this.dest);
        return cb(null, this._process());
    }

    if (!isFunction(this.optimizer)) {
        return cb();
    }

    var self = this;
    var optimizer = this.optimizer(this.src, this.dest, cb);

    optimizer.on('error', function (err) {
        return cb(new Error(err));
    });

    optimizer.stderr.on('data', function (data) {
        return cb(new Error(data.toString()));
    });

    optimizer.once('close', function (code) {
        if (code === 0) {
            return cb(null, self._process());
        }
    });
};

/**
 * Get the optimizer for a desired file
 *
 * @param {String} src
 * @api private
 */

Imagemin.prototype._getOptimizer = function (src) {
    src = src.toLowerCase();

    var ext = find(this.optimizerTypes, function (ext) {
        return endsWith(src, ext);
    });

    return ext ? this.optimizers[ext] : null;
};

/**
 * Optimize a GIF image
 *
 * @param {String} src
 * @param {String} dest
 * @api private
 */

Imagemin.prototype._optimizeGif = function (src, dest) {
    var args = ['-w'];
    var gifsicle = require('gifsicle').path;

    if (this.opts.interlaced) {
        args.push('--interlace');
    }

    return spawn(gifsicle, args.concat(['-o', dest, src]));
};

/**
 * Optimize a JPEG image
 *
 * @param {String} src
 * @param {String} dest
 * @api private
 */

Imagemin.prototype._optimizeJpeg = function (src, dest) {
    var args = ['-copy', 'none', '-optimize'];
    var jpegtran = require('jpegtran-bin').path;

    if (this.opts.progressive) {
        args.push('-progressive');
    }

    return spawn(jpegtran, args.concat(['-outfile', dest, src]));
};

/**
 * Optimize a PNG image
 *
 * @param {String} src
 * @param {String} dest
 * @api private
 */

Imagemin.prototype._optimizePng = function (src, dest) {
    var args = ['-strip', 'all', '-quiet'];
    var optipng = require('optipng-bin').path;

    if (typeof this.opts.optimizationLevel === 'number') {
        args.push('-o', this.opts.optimizationLevel);
    }

    return spawn(optipng, args.concat(['-out', dest, src]));
};

/**
 * Process optimized images
 *
 * @api private
 */

Imagemin.prototype._process = function () {
    var size = fs.statSync(this.src).size;
    var saved = size - fs.statSync(this.dest).size;

    if (this.opts.cache && !cache.check(this.src)) {
        cache.store(this.dest, this.src);
    }

    var data = {
        origSize: filesize(size),
        origSizeRaw: size,
        diffSize: filesize(saved),
        diffSizeRaw: saved
    };

    return data;
};

/**
 * Module exports
 */

module.exports = function (src, dest, opts, cb) {
    if (!cb && isFunction(opts)) {
        cb = opts;
        opts = {};
    }

    var imagemin = new Imagemin(src, dest, opts);
    return imagemin.optimize(cb);
};
