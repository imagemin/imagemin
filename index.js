'use strict';

var concat = require('concat-stream');
var filesize = require('filesize');
var isFunction = require('mout/lang/isFunction');
var map = require('map-key');
var pipe = require('multipipe');
var pipeline = require('stream-combiner');
var spawn = require('win-spawn');
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
    this.optimizationLevel = opts.optimizationLevel || 7;
    this.ext = opts.ext || '';
    this.optimizers = {
        '.gif': this._optimizeGif,
        '.jpg': this._optimizeJpeg,
        '.jpeg': this._optimizeJpeg,
        '.png': this._optimizePng
    };
    this.optimizer = this._getOptimizer(this.ext);
}

/**
 * Optimize GIF, JPEG, and PNG images
 *
 * @api public
 */

Imagemin.prototype.optimize = function () {
    var cp = this.optimizer();
    var stream = pipe(cp.stdin, cp.stdout);
    var src = through();
    var size;
    var sizeDest;

    src.pipe(concat(function (data) {
        size = new Buffer(data).length;
    }));

    cp.stdout.pipe(concat(function (data) {
        sizeDest = new Buffer(data).length;
    }));

    cp.stdout.on('end', function () {
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
    return map(this.optimizers, src);
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
    var args = ['-strip', 'all', '-quiet'];
    var optipng = require('optipng-bin').stream;
    var pngquant;

    if (typeof this.optimizationLevel === 'number') {
        args.push('-o', this.optimizationLevel);
    }

    if (this.opts.pngquant) {
        pngquant = require('pngquant-bin').path;
        return spawn(optipng, args).stdout.pipe(spawn(pngquant, ['-']));
    }

    return spawn(optipng, args);
};

/**
 * Module exports
 */

module.exports = function (opts) {
    var imagemin = new Imagemin(opts);

    if (!isFunction(imagemin.optimizer)) {
        return through();
    }

    return imagemin.optimize();
};
