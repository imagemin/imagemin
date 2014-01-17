/*global after, before, describe, it */
'use strict';

var assert = require('assert');
var fs = require('fs');
var imagemin = require('../imagemin');
var path = require('path');
var rm = require('rimraf');

describe('Imagemin.optimize()', function () {
    before(function () {
        fs.mkdirSync(path.join(__dirname, 'tmp'));
    });

    after(function () {
        rm.sync(path.join(__dirname, 'tmp'));
    });

    it('should minify a GIF image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.gif');
        var dest = path.join(__dirname, 'tmp/test.gif');

        fs.createReadStream(src)
            .pipe(imagemin({ ext: '.gif' }))
            .pipe(fs.createWriteStream(dest).on('close', function () {
                cb(assert.ok(fs.statSync(dest).size < fs.statSync(src).size));
            }));
    });

    it('should minify a JPG image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.jpg');
        var dest = path.join(__dirname, 'tmp/test.jpg');

        fs.createReadStream(src)
            .pipe(imagemin({ ext: '.jpg' }))
            .pipe(fs.createWriteStream(dest).on('close', function () {
                cb(assert.ok(fs.statSync(dest).size < fs.statSync(src).size));
            }));
    });

    it('should minify a PNG image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.png');
        var dest = path.join(__dirname, 'tmp/test.png');

        fs.createReadStream(src)
            .pipe(imagemin({ ext: '.png' }))
            .pipe(fs.createWriteStream(dest).on('close', function () {
                cb(assert.ok(fs.statSync(dest).size < fs.statSync(src).size));
            }));
    });

    it('should skip optimizing a non supported image', function (cb) {
        var src = path.join(__dirname, 'fixtures/test.bmp');
        var dest = path.join(__dirname, 'tmp/test.bmp');

        fs.createReadStream(src)
            .pipe(imagemin({ ext: '.bmp' }))
            .pipe(fs.createWriteStream(dest).on('close', function () {
                cb(assert.ok(fs.statSync(dest).size === fs.statSync(src).size));
            }));
    });

    it('should return size data', function (cb) {
        var src = path.join(__dirname, 'fixtures/test-data.jpg');
        var dest = path.join(__dirname, 'tmp/test-data.jpg');
        var size;

        fs.createReadStream(src)
            .pipe(imagemin({ ext: '.jpg' }).on('close', function (data) {
                size = data;
            }))
            .pipe(fs.createWriteStream(dest).on('close', function () {
                assert.equal(size.origSize, '50.99 kB');
                assert.equal(size.origSizeRaw, 50986);
                assert.equal(size.diffSize, '4.00 kB');
                assert.equal(size.diffSizeRaw, 3999);
                cb();
            }));
    });
});
