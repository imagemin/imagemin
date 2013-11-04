'use strict';

var gifsicle = require('gifsicle').path;
var grunt = require('grunt');
var jpegtran = require('jpegtran-bin').path;
var mout = require('mout');
var optipng = require('optipng-bin').path;
var pngquant = require('pngquant-bin').path;

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
    if (!cb || !mout.lang.isFunction(cb)) {
        cb = function () {};
    }

    return this.optimizer(this.src, this.dest, cb);
};

/**
 * Get the optimizer for a desired file
 *
 * @param {String} src
 * @api private
 */

Imagemin.prototype._getOptimizer = function (src) {
    src = src.toLowerCase();

    var ext = mout.array.find(this.optimizerTypes, function (ext) {
        return mout.string.endsWith(src, ext);
    });

    return ext ? this.optimizers[ext] : null;
};

/**
 * Optimize a GIF image
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} cb
 * @api private
 */

Imagemin.prototype._optimizeGif = function (src, dest, cb) {
    var args = ['-w'];

    if (this.opts.interlaced) {
        args.push('--interlace');
    }

    var optimizer = grunt.util.spawn({
        cmd: gifsicle,
        args: args.concat(['-o', dest, src])
    }, cb);

    return optimizer;
};

/**
 * Optimize a JPEG image
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} cb
 * @api private
 */

Imagemin.prototype._optimizeJpeg = function (src, dest, cb) {
    var args = ['-copy', 'none', '-optimize'];

    if (this.opts.progressive) {
        args.push('-progressive');
    }

    var optimizer = grunt.util.spawn({
        cmd: jpegtran,
        args: args.concat(['-outfile', dest, src])
    }, cb);

    return optimizer;
};

/**
 * Optimize a PNG image
 *
 * @param {String} src
 * @param {String} dest
 * @param {Function} cb
 * @api private
 */

Imagemin.prototype._optimizePng = function (src, dest, cb) {
    var args = ['-strip', 'all'];
    var optimizer;
    var tmpDest = dest + '.tmp';

    if (typeof this.opts.optimizationLevel === 'number') {
        args.push('-o', this.opts.optimizationLevel);
    }

    if (this.opts.pngquant) {
        optimizer = grunt.util.spawn({
            cmd: pngquant,
            args: ['-o', tmpDest, src]
        }, function () {
            grunt.util.spawn({
                cmd: optipng,
                args: args.concat(['-out', dest, tmpDest])
            }, function () {
                grunt.file.delete(tmpDest);
                cb();
            });
        });
    } else {
        optimizer = grunt.util.spawn({
            cmd: optipng,
            args: args.concat(['-out', dest, src])
        }, cb);
    }

    return optimizer;
};

/**
 * Module exports
 */

module.exports = function (src, dest, opts, cb) {
    if (!cb && mout.lang.isFunction(opts)) {
        cb = opts;
        opts = {};
    }

    var imagemin = new Imagemin(src, dest, opts);
    return imagemin.optimize(cb);
};
