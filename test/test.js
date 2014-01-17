/*global afterEach, describe, it */
'use strict';

var assert = require('assert');
var cache = require('cache-file');
var fs = require('fs');
var imagemin = require('../imagemin');
var path = require('path');
var rm = require('rimraf');

afterEach(function () {
    rm.sync(path.join(__dirname, 'tmp'));
    cache.clean(path.join(__dirname, 'fixtures/test-cache.jpg'));
});

describe('Imagemin.optimize()', function () {
    it('should minify a GIF image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.gif');
        var dest = path.join(__dirname, 'tmp/test.gif');

        imagemin(src, dest, function () {
            cb(assert.ok(fs.statSync(dest).size < fs.statSync(src).size));
        });
    });

    it('should minify a JPEG image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.jpg');
        var dest = path.join(__dirname, 'tmp/test.jpg');

        imagemin(src, dest, function () {
            cb(assert.ok(fs.statSync(dest).size < fs.statSync(src).size));
        });
    });

    it('should minify a PNG image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.png');
        var dest = path.join(__dirname, 'tmp/test.png');

        imagemin(src, dest, function () {
            cb(assert.ok(fs.statSync(dest).size < fs.statSync(src).size));
        });
    });

    it('should skip a unsupported image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.bmp');
        var dest = path.join(__dirname, 'tmp/test.bmp');

        imagemin(src, dest, function () {
            fs.exists(dest, function (exists) {
                cb(assert.ok(!exists));
            });
        });
    });

    it('should store an optimized image in cache', function (cb) {
        var src = path.join(__dirname, 'fixtures/test-cache.jpg');
        var dest = path.join(__dirname, 'tmp/test-cache.jpg');

        imagemin(src, dest, { cache: true }, function () {
            cb(assert.ok(cache.check(src)));
        });
    });
});
