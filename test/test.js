/*global describe, it */
'use strict';

var assert = require('assert');
var imagemin = require('../imagemin');
var path = require('path');

describe('Imagemin.optimize()', function () {
    it('should minify a GIF image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.gif');
        var dest = path.join(__dirname, 'tmp/test.gif');

        imagemin(src, dest, function () {
            assert(dest > src);
            cb();
        });
    });
    it('should minify a JPEG image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.jpg');
        var dest = path.join(__dirname, 'tmp/test.jpg');

        imagemin(src, dest, function () {
            assert(dest > src);
            cb();
        });
    });
    it('should minify a PNG image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.png');
        var dest = path.join(__dirname, 'tmp/test.png');

        imagemin(src, dest, function () {
            assert(dest > src);
            cb();
        });
    });
});

