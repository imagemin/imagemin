#!/usr/bin/env node
'use strict';

var fs = require('fs');
var meow = require('meow');
var stdin = require('get-stdin');
var Imagemin = require('./');

/**
 * Initialize CLI
 */

var cli = meow({
	help: [
		'Usage',
		'  imagemin <file> <directory>',
		'  imagemin <file> > <output>',
		'  cat <file> | imagemin > <output>',
		'',
		'Example',
		'  imagemin images/* build',
		'  imagemin foo.png > foo-optimized.png',
		'  cat foo.png | imagemin > foo-optimized.png',
		'',
		'Options',
		'  -i, --interlaced                    Interlace gif for progressive rendering',
		'  -o, --optimizationLevel <number>    Optimization level between 0 and 7',
		'  -p, --progressive                   Lossless conversion to progressive'
	].join('\n')
}, {
	boolean: [
		'interlaced',
		'progressive'
	],
	string: [
		'optimizationLevel'
	],
	alias: {
		i: 'interlaced',
		o: 'optimizationLevel',
		p: 'progressive'
	}
});

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
	} catch (err) {
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
		.use(Imagemin.gifsicle(cli.flags))
		.use(Imagemin.jpegtran(cli.flags))
		.use(Imagemin.pngquant(cli.flags))
		.use(Imagemin.optipng(cli.flags))
		.use(Imagemin.svgo());

	if (process.stdout.isTTY) {
		imagemin.dest(dest ? dest : 'build');
	}

	imagemin.run(function (err, files) {
		if (err) {
			console.error(err.message);
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
	var src = cli.input;
	var dest;

	if (!cli.input.length) {
		console.error([
			'Provide at least one file to optimize',
			'',
			'Example',
			'  imagemin images/* build',
			'  imagemin foo.png > foo-optimized.png',
			'  cat foo.png | imagemin > foo-optimized.png'
		].join('\n'));

		process.exit(1);
	}

	if (!isFile(src[src.length - 1])) {
		dest = src[src.length - 1];
		src.pop();
	}

	run(src, dest);
} else {
	stdin.buffer(run);
}
