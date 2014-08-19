#!/usr/bin/env node
'use strict';

var fs = require('fs');
var Imagemin = require('./');
var nopt = require('nopt');
var path = require('path');
var pkg = require('./package.json');
var stdin = require('get-stdin');

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
    console.log(pkg.description);
    console.log('');
    console.log('Usage');
    console.log('  $ imagemin <file> <directory>');
    console.log('  $ imagemin <file> > <output>');
    console.log('  $ cat <file> | imagemin > <output>');
    console.log('');
    console.log('Example');
    console.log('  $ imagemin images/* build');
    console.log('  $ imagemin foo.png > foo-optimized.png');
    console.log('  $ cat foo.png | imagemin > foo-optimized.png');
    console.log('');
    console.log('Options');
    console.log('  -i, --interlaced                    Interlace gif for progressive rendering');
    console.log('  -o, --optimizationLevel <number>    Select an optimization level between 0 and 7');
    console.log('  -p, --progressive                   Lossless conversion to progressive');
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

    if (input.length === 0) {
        help();
        return;
    }

    if (input.length > 1 && !isFile(input[input.length - 1])) {
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
    stdin.buffer(function (data) {
        run(data);
    });
}
