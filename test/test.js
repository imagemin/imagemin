/*global describe, it */
'use strict';

var assert = require('assert');
var cache = require('cache-file');
var fs = require('fs');
var imagemin = require('../imagemin');
var path = require('path');

describe('Imagemin.optimize()', function () {
    it('should minify a GIF image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.gif');
        var dest = path.join(__dirname, 'tmp/test.gif');

        imagemin(src, dest, function () {
            assert.ok(fs.statSync(dest).size < fs.statSync(src).size);
            cb();
        });
    });
    it('should minify a JPEG image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.jpg');
        var dest = path.join(__dirname, 'tmp/test.jpg');

        imagemin(src, dest, function () {
            assert.ok(fs.statSync(dest).size < fs.statSync(src).size);
            cb();
        });
    });
    it('should minify a PNG image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.png');
        var dest = path.join(__dirname, 'tmp/test.png');

        imagemin(src, dest, function () {
            assert.ok(fs.statSync(dest).size < fs.statSync(src).size);
            cb();
        });
    });
    it('should store an optimized image in cache', function (cb) {
        var src = path.join(__dirname, 'fixtures/test-cache.jpg');
        var dest = path.join(__dirname, 'tmp/test-cache.jpg');

        imagemin(src, dest, { cache: true }, function () {
            assert.ok(cache.check(src, { name: 'imagemin' }));
            cache.clean(src, { name: 'imagemin' });
            cb();
        });
    });
});
