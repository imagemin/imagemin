#!/usr/bin/env node
'use strict';

var fs = require('fs');
var Imagemin = require('./');
var nopt = require('nopt');
var pkg = require('./package.json');

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
    console.log('  $ imagemin <file> > <output>');
    console.log('  $ cat <file> | imagemin > <output>');
    console.log('');
    console.log('Example');
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
 * Run
 */

function run(input) {
    var imagemin = new Imagemin()
        .src(input)
        .use(Imagemin.gifsicle(opts))
        .use(Imagemin.jpegtran(opts))
        .use(Imagemin.optipng(opts))
        .use(Imagemin.svgo());

    imagemin.optimize(function (err, file) {
        if (err) {
            console.err(err);
            process.exit(1);
        }

        process.stdout.write(file.contents);
    });
}

/**
 * Apply arguments
 */

if (process.stdin.isTTY) {
    var input = opts.argv.remain;

    if (input.length === 0) {
        help();
        return;
    }

    if (input.length > 1) {
        console.error('Only one input file allowed');
        process.exit(1);
    }

    fs.readFile(input[0], function (err, data) {
        if (err) {
            console.error(err);
            process.exit(1);
        }

        run(data);
    });
} else {
    var ret = [];

    process.stdin.on('data', function (data) {
        ret.push(data);
    });

    process.stdin.on('end', function () {
        run(Buffer.concat(ret));
    });
}
