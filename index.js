'use strict';

var map = require('map-key');
var pipeline = require('multipipe');
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
    this.optimizer = this._getOptimizer(opts.ext);
    this.optimizationLevel = opts.optimizationLevel || 7;
}

/**
 * Optimize GIF, JPEG, and PNG images
 *
 * @api public
 */

Imagemin.prototype.optimize = function () {
    var cp = this.optimizer();
    var stream = through();

    return pipeline(stream, cp.stdin, cp.stdout);
};

/**
 * Get the optimizer for a desired file extension
 *
 * @param {String} ext
 * @api private
 */

Imagemin.prototype._getOptimizer = function (ext) {
    ext = ext ? ext.toLowerCase() : null;

    var optimizers = {
        '.gif': this._optimizeGif,
        '.jpg': this._optimizeJpeg,
        '.jpeg': this._optimizeJpeg,
        '.png': this._optimizePng
    };

    return map(optimizers, ext);
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

Imagemin.prototype._optimizeJpeg = function () {
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

    if (!imagemin.optimizer) {
        return through();
    }

    return imagemin.optimize();
};
