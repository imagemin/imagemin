'use strict';

var fs = require('fs-extra');
var mode = require('stat-mode');
var Ware = require('ware');

/**
 * Initialize Imagemin
 *
 * @api public
 */

function Imagemin() {
	if (!(this instanceof Imagemin)) {
		return new Imagemin();
	}

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
 * Get or set the source file
 *
 * @param {String|Buffer} file
 * @api public
 */

Imagemin.prototype.src = function (file) {
	if (!arguments.length) {
		return this._src;
	}

	this._src = file;
	return this;
};

/**
 * Get or set the destination file
 *
 * @param {String} file
 * @api public
 */

Imagemin.prototype.dest = function (file) {
	if (!arguments.length) {
		return this._dest;
	}

	this._dest = file;
	return this;
};

/**
 * Optimize file
 *
 * @param {Function} cb
 * @api public
 */

Imagemin.prototype.optimize = function (cb) {
	cb = cb || function () {};
	var self = this;

	this._read(function (err, file) {
		if (err) {
			cb(err);
			return;
		}

		if (!file || !file.contents) {
			cb();
			return;
		}

		var buf = file.contents;

		self._run(file, function (err, file) {
			if (err) {
				cb(err);
				return;
			}

			if (file.contents.length >= buf.length) {
				file.contents = buf;
			}

			self._write(file, function (err) {
				if (err) {
					cb(err);
					return;
				}

				cb(null, file);
			});
		});
	});
};

/**
 * Run a file through the middleware
 *
 * @param {Object} file
 * @param {Function} cb
 * @api private
 */

Imagemin.prototype._run = function (file, cb) {
	this.ware.run(file, this, cb);
};

/**
 * Read the source file
 *
 * @param {Function} cb
 * @api private
 */

Imagemin.prototype._read = function (cb) {
	var file = {};
	var src = this.src();

	if (Buffer.isBuffer(src)) {
		file.contents = src;
		cb(null, file);
		return;
	}

	fs.stat(src, function (err, stats) {
		if (err) {
			cb(err);
			return;
		}

		if (!stats.isFile()) {
			cb();
			return;
		}

		fs.readFile(src, function (err, buf) {
			if (err) {
				cb(err);
				return;
			}

			file.contents = buf;
			file.mode = mode(stats).toOctal();

			cb(null, file);
		});
	});
};

/**
 * Write file to destination
 *
 * @param {Object} file
 * @param {Function} cb
 * @api private
 */

Imagemin.prototype._write = function (file, cb) {
	var dest = this.dest();

	if (!dest) {
		cb();
		return;
	}

	fs.outputFile(dest, file.contents, function (err) {
		if (err) {
			cb(err);
			return;
		}

		cb();
	});
};

/**
 * Module exports
 */

module.exports = Imagemin;
module.exports.gifsicle = require('imagemin-gifsicle');
module.exports.jpegtran = require('imagemin-jpegtran');
module.exports.optipng = require('imagemin-optipng');
module.exports.pngquant = require('imagemin-pngquant');
module.exports.svgo = require('imagemin-svgo');
