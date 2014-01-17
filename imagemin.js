'use strict';

var concat = require('concat-stream');
var duplex = require('duplexer');
var endsWith = require('mout/string/endsWith');
var filesize = require('filesize');
var find = require('mout/array/find');
var isFunction = require('mout/lang/isFunction');
var pipeline = require('stream-combiner');
var spawn = require('child_process').spawn;
var through = require('through2');

/**
 * Initialize `Imagemin` with options
 *
 * @param {Object} opts
 * @api private
 */

function Imagemin(opts) {
    opts = opts || {};
    this.opts = opts;
    this.ext = opts.ext || '';
    this.optimizers = {
        '.gif': this._optimizeGif,
        '.jpg': this._optimizeJpeg,
        '.jpeg': this._optimizeJpeg,
        '.png': this._optimizePng
    };
    this.optimizerTypes = Object.keys(this.optimizers);
    this.optimizer = this._getOptimizer(this.ext);
}

/**
 * Optimize GIF, JPEG, and PNG images
 *
 * @api public
 */

Imagemin.prototype.optimize = function () {
    var cp = this.optimizer();
    var size = [];
    var sizeDest;
    var stream = duplex(cp.stdin, cp.stdout);
    var src = through(function (data, enc, cb) {
        size.push(data);
        this.push(data);
        cb();
    });

    cp.stdout.pipe(concat(function (data) {
        sizeDest = new Buffer(data).length;
    }));

    cp.stdout.on('close', function () {
        size = Buffer.concat(size).length;

        var saved = size - sizeDest;
        var data = {
            origSize: filesize(size),
            origSizeRaw: size,
            diffSize: filesize(saved),
            diffSizeRaw: saved
        };

        stream.emit('close', data);
    });

    return pipeline(src, stream);
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
 * @api private
 */

Imagemin.prototype._optimizeGif = function () {
    var args = ['-w'];
    var gifsicle = require('gifsicle').path;

    if (this.opts.interlaced) {
        args.push('--interlace');
    }

    return spawn(gifsicle, args);
};

/**
 * Optimize a JPEG image
 *
 * @api private
 */

Imagemin.prototype._optimizeJpeg = function ( ){
    var args = ['-copy', 'none', '-optimize'];
    var jpegtran = require('jpegtran-bin').path;

    if (this.opts.progressive) {
        args.push('-progressive');
    }

    return spawn(jpegtran, args);
};

/**
 * Optimize a PNG image
 *
 * @api private
 */

Imagemin.prototype._optimizePng = function () {
    var args = ['-'];
    var pngquant = require('pngquant-bin').path;

    return spawn(pngquant, args);
};

/**
 * Module exports
 */

module.exports = function (opts) {
    var imagemin = new Imagemin(opts);

    if (!isFunction(imagemin._getOptimizer(opts.ext))) {
        return through();
    }

    return imagemin.optimize();
};
