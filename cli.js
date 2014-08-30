#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
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
	l: '--optimizationLevel',
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
 * @param {Buffer} input
 * @param {Object} opts
 * @api private
 */

function run(input, opt) {
	var imagemin = new Imagemin()
		.src(input)
		.use(Imagemin.gifsicle(opts))
		.use(Imagemin.jpegtran(opts))
		.use(Imagemin.optipng(opts))
		.use(Imagemin.svgo());

	if (process.stdout.isTTY) {
		var name = path.basename(opt.input);
		var out = path.join(opt.output ? opt.output : 'build', name);

		imagemin.dest(path.join(out));
	}

	imagemin.optimize(function (err, file) {
		if (err) {
			console.error(err);
			process.exit(1);
		}

		if (!process.stdout.isTTY) {
			process.stdout.write(file.contents);
		}
	});
}

/**
 * Apply arguments
 */

if (process.stdin.isTTY) {
	var input = opts.argv.remain;
	var output;

	if (!input.length) {
		help();
		return;
	}

	if (!isFile(input[input.length - 1])) {
		output = input[input.length - 1];
		input.pop();
	}

	input.forEach(function (file) {
		fs.readFile(file, function (err, data) {
			if (err) {
				console.error(err);
				process.exit(1);
			}

			run(data, { input: file, output: output });
		});
	});
} else {
	stdin.buffer(run);
}
