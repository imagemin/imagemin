#!/usr/bin/env node
'use strict';

var fs = require('fs');
var nopt = require('nopt');
var stdin = require('get-stdin');
var pkg = require('./package.json');
var Imagemin = require('./');

/**
 * Options
 */

var opts = nopt({
	help: Boolean,
	interlaced: Boolean,
	optimizationLevel: Number,
	progressive: Boolean,
	version: Boolean
}, {
	h: '--help',
	i: '--interlaced',
	o: '--optimizationLevel',
	p: '--progressive',
	v: '--version'
});

/**
 * Help screen
 */

function help() {
	console.log([
		'',
		'  ' + pkg.description,
		'',
		'  Usage',
		'    imagemin <file> <directory>',
		'    imagemin <file> > <output>',
		'    cat <file> | imagemin > <output>',
		'',
		'  Example',
		'    imagemin images/* build',
		'    imagemin foo.png > foo-optimized.png',
		'    cat foo.png | imagemin > foo-optimized.png',
		'',
		'  Options',
		'    -i, --interlaced                    Interlace gif for progressive rendering',
		'    -o, --optimizationLevel <number>    Select an optimization level between 0 and 7',
		'    -p, --progressive                   Lossless conversion to progressive'
	].join('\n'));
}

/**
 * Show help
 */

if (opts.help) {
	help();
	return;
}

/**
 * Show package version
 */

if (opts.version) {
	console.log(pkg.version);
	return;
}

/**
 * Check if path is a file
 *
 * @param {String} path
 * @api private
 */

function isFile(path) {
	if (/^[^\s]+\.\w*$/g.test(path)) {
		return true;
	}

	try {
		return fs.statSync(path).isFile();
	} catch (e) {
		return false;
	}
}

/**
 * Run
 *
 * @param {Array|Buffer|String} src
 * @param {String} dest
 * @api private
 */

function run(src, dest) {
	var imagemin = new Imagemin()
		.src(src)
		.use(Imagemin.gifsicle(opts))
		.use(Imagemin.jpegtran(opts))
		.use(Imagemin.optipng(opts))
		.use(Imagemin.pngquant(opts))
		.use(Imagemin.svgo());

	if (process.stdout.isTTY) {
		imagemin.dest(dest ? dest : 'build');
	}

	imagemin.run(function (err, files) {
		if (err) {
			console.error(err);
			process.exit(1);
		}

		if (!process.stdout.isTTY) {
			files.forEach(function (file) {
				process.stdout.write(file.contents);
			});
		}
	});
}

/**
 * Apply arguments
 */

if (process.stdin.isTTY) {
	var src = opts.argv.remain;
	var dest;

	if (!src.length) {
		help();
		return;
	}

	if (!isFile(src[src.length - 1])) {
		dest = src[src.length - 1];
		src.pop();
	}

	run(src, dest);
} else {
	stdin.buffer(run);
}
