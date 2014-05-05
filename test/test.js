/*global after, describe, it */
'use strict';

var assert = require('assert');
var fs = require('fs');
var Imagemin = require('../');
var path = require('path');
var rm = require('rimraf');

describe('Imagemin()', function () {
    after(function (cb) {
        rm(path.join(__dirname, 'tmp'), cb);
    });

    it('should optimize a GIF', function (cb) {
        var imagemin = new Imagemin();

        imagemin
            .src(path.join(__dirname, 'fixtures/test.gif'))
            .dest(path.join(__dirname, 'tmp/test.gif'))
            .use(Imagemin.gifsicle())
            .optimize(function () {
                assert(fs.statSync(imagemin.dest()).size < fs.statSync(imagemin.src()).size);
                assert(fs.statSync(imagemin.dest()).size > 0);
                cb();
            });
    });

    it('should optimize a JPG', function (cb) {
        var imagemin = new Imagemin();

        imagemin
            .src(path.join(__dirname, 'fixtures/test.jpg'))
            .dest(path.join(__dirname, 'tmp/test.jpg'))
            .use(Imagemin.jpegtran())
            .optimize(function () {
                assert(fs.statSync(imagemin.dest()).size < fs.statSync(imagemin.src()).size);
                assert(fs.statSync(imagemin.dest()).size > 0);
                cb();
            });
    });

    it('should optimize a PNG', function (cb) {
        var imagemin = new Imagemin();

        imagemin
            .src(path.join(__dirname, 'fixtures/test.png'))
            .dest(path.join(__dirname, 'tmp/test.png'))
            .use(Imagemin.optipng())
            .optimize(function () {
                assert(fs.statSync(imagemin.dest()).size < fs.statSync(imagemin.src()).size);
                assert(fs.statSync(imagemin.dest()).size > 0);
                cb();
            });
    });

    it('should optimize a SVG', function (cb) {
        var imagemin = new Imagemin();

        imagemin
            .src(path.join(__dirname, 'fixtures/test.svg'))
            .dest(path.join(__dirname, 'tmp/test.svg'))
            .use(Imagemin.svgo())
            .optimize(function () {
                assert(fs.statSync(imagemin.dest()).size < fs.statSync(imagemin.src()).size);
                assert(fs.statSync(imagemin.dest()).size > 0);
                cb();
            });
    });

    it('should optimize a image using Buffer', function (cb) {
        var buf = fs.readFileSync(path.join(__dirname, 'fixtures/test.jpg'));
        var imagemin = new Imagemin();

        imagemin
            .src(buf)
            .use(Imagemin.jpegtran())
            .optimize(function (err, file) {
                assert(file.contents.length < buf.length);
                cb();
            });
    });

    it('should ignore directories', function (cb) {
        var imagemin = new Imagemin();

        imagemin
            .src(path.join(__dirname, 'fixtures/test'))
            .use(Imagemin.jpegtran())
            .optimize(function (err) {
                assert(!err);
                cb();
            });
    });
});
