'use strict';

var combine = require('stream-combiner');
var concat = require('concat-stream');
var File = require('vinyl');
var fs = require('vinyl-fs');
var optional = require('optional');
var through = require('through2');

/**
 * Initialize Imagemin
 *
 * @api public
 */

function Imagemin() {
	if (!(this instanceof Imagemin)) {
		return new Imagemin();
	}

	this.streams = [];
}

/**
 * Get or set the source files
 *
 * @param {Array|Buffer|String} file
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
 * Get or set the destination folder
 *
 * @param {String} dir
 * @api public
 */

Imagemin.prototype.dest = function (dir) {
	if (!arguments.length) {
		return this._dest;
	}

	this._dest = dir;
	return this;
};

/**
 * Add a plugin to the middleware stack
 *
 * @param {Function} plugin
 * @api public
 */

Imagemin.prototype.use = function (plugin) {
	this.streams.push(typeof plugin === 'function' ? plugin() : plugin);
	return this;
};

/**
 * Optimize files
 *
 * @param {Function} cb
 * @api public
 */

Imagemin.prototype.run = function (cb) {
	cb = cb || function () {};

	if (!this.streams.length) {
		this.use(Imagemin.gifsicle());
		this.use(Imagemin.jpegtran());
		this.use(Imagemin.pngquant());
		this.use(Imagemin.optipng());
		this.use(Imagemin.svgo());
	}

	this.streams.unshift(this.read(this.src()));

	if (this.dest()) {
		this.streams.push(fs.dest(this.dest()));
	}

	var pipe = combine(this.streams);
	var end = concat(function (files) {
		cb(null, files, pipe);
	});

	pipe.on('error', cb);
	pipe.pipe(end);
};

/**
 * Read the source file
 *
 * @param {Array|Buffer|String} src
 * @api private
 */

Imagemin.prototype.read = function (src) {
	if (Buffer.isBuffer(src)) {
		var stream = through.obj();

		stream.end(new File({
			contents: src
		}));

		return stream;
	}

	return fs.src(src);
};

/**
 * Module exports
 */

module.exports = Imagemin;

[
	'gifsicle',
	'jpegtran',
	'optipng',
	'pngquant',
	'svgo'
].forEach(function (plugin) {
	module.exports[plugin] = optional('imagemin-' + plugin) || function () {
		return through.ctor({ objectMode: true });
	};
});
