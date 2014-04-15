/*global after, before, describe, it */
'use strict';

var assert = require('assert');
var gifsicle = require('../lib/').gifsicle;
var fs = require('fs');
var Imagemin = require('../lib/');
var jpegtran = require('../lib/').jpegtran;
var optipng = require('../lib/').optipng;
var path = require('path');
var rm = require('rimraf');

describe('Imagemin()', function () {
    after(function (cb) {
        rm(path.join(__dirname, 'tmp'), cb);
    });

    before(function () {
        this.src = [
            path.join(__dirname, 'fixtures/test.gif'),
            path.join(__dirname, 'fixtures/test.jpg'),
            path.join(__dirname, 'fixtures/test.png')
        ];

        this.imagemin = new Imagemin()
            .source(this.src)
            .destination(path.join(__dirname, 'tmp'));
    });

    it('should optimize a GIF', function (cb) {
        var dest = path.join(__dirname, 'tmp/test.gif');
        var self = this;

        this.imagemin
            .use(gifsicle())
            .optimize(function () {
                assert(fs.statSync(dest).size < fs.statSync(self.src[0]).size);
                assert(fs.statSync(dest).size > 0);
                cb();
            });
    });

    it('should optimize a JPG', function (cb) {
        var dest = path.join(__dirname, 'tmp/test.jpg');
        var self = this;

        this.imagemin
            .use(jpegtran())
            .optimize(function () {
                assert(fs.statSync(dest).size < fs.statSync(self.src[1]).size);
                assert(fs.statSync(dest).size > 0);
                cb();
            });
    });

    it('should optimize a PNG', function (cb) {
        var dest = path.join(__dirname, 'tmp/test.png');
        var self = this;

        this.imagemin
            .use(optipng())
            .optimize(function () {
                assert(fs.statSync(dest).size < fs.statSync(self.src[2]).size);
                assert(fs.statSync(dest).size > 0);
                cb();
            });
    });

    it('should optimize a PNG without writing', function (cb) {
        var self = this;

        this.imagemin
            .use(optipng())
            .read(function (err, files) {
                self.imagemin.run(files, function (err, files) {
                    cb(assert(files['test/fixtures/test.png'].contents.length < fs.readFileSync(self.src[2]).length));
                });
            });
    });
});
