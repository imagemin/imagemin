'use strict';

var fs = require('fs');
var Imagemin = require('../');
var path = require('path');
var test = require('ava');

test('optimize a GIF', function (t) {
	t.plan(5);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.gif'))
		.dest(path.join(__dirname, 'tmp/test.gif'))
		.use(Imagemin.gifsicle());

	imagemin.optimize(function (err) {
		t.assert(!err);

		fs.stat(imagemin.dest(), function (err, a) {
			t.assert(!err);
			t.assert(a.size > 0);

			fs.stat(imagemin.src(), function (err, b) {
				t.assert(!err);
				t.assert(a.size < b.size);
			});
		});
	});
});

test('optimize a JPG', function (t) {
	t.plan(5);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.jpg'))
		.dest(path.join(__dirname, 'tmp/test.jpg'))
		.use(Imagemin.jpegtran());

	imagemin.optimize(function (err) {
		t.assert(!err);

		fs.stat(imagemin.dest(), function (err, a) {
			t.assert(!err);
			t.assert(a.size > 0);

			fs.stat(imagemin.src(), function (err, b) {
				t.assert(!err);
				t.assert(a.size < b.size);
			});
		});
	});
});

test('optimize a PNG', function (t) {
	t.plan(5);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.png'))
		.dest(path.join(__dirname, 'tmp/test.png'))
		.use(Imagemin.optipng());

	imagemin.optimize(function (err) {
		t.assert(!err);

		fs.stat(imagemin.dest(), function (err, a) {
			t.assert(!err);
			t.assert(a.size > 0);

			fs.stat(imagemin.src(), function (err, b) {
				t.assert(!err);
				t.assert(a.size < b.size);
			});
		});
	});
});

test('optimize a SVG', function (t) {
	t.plan(5);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.svg'))
		.dest(path.join(__dirname, 'tmp/test.svg'))
		.use(Imagemin.svgo());

	imagemin.optimize(function (err) {
		t.assert(!err);

		fs.stat(imagemin.dest(), function (err, a) {
			t.assert(!err);
			t.assert(a.size > 0);

			fs.stat(imagemin.src(), function (err, b) {
				t.assert(!err);
				t.assert(a.size < b.size);
			});
		});
	});
});

test('output error on corrupt images', function (t) {
	t.plan(1);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test-corrupt.jpg'))
		.dest(path.join(__dirname, 'tmp/test-corrupt.jpg'))
		.use(Imagemin.jpegtran());

	imagemin.optimize(function (err) {
		t.assert(err);
	});
});
