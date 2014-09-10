'use strict';

var fs = require('fs');
var Imagemin = require('../');
var path = require('path');
var test = require('ava');

test('expose a constructor', function (t) {
	t.plan(1);
	t.assert(typeof Imagemin === 'function');
});

test('add a plugin to the middleware stack', function (t) {
	t.plan(1);

	var imagemin = new Imagemin()
		.use(function () {});

	t.assert(imagemin.streams.length === 1);
});

test('set source file', function (t) {
	t.plan(1);

	var imagemin = new Imagemin()
		.src('test.jpg');

	t.assert(imagemin._src === 'test.jpg');
});

test('set destination folder', function (t) {
	t.plan(1);

	var imagemin = new Imagemin()
		.dest('tmp');

	t.assert(imagemin._dest === 'tmp');
});

test('optimize a GIF', function (t) {
	t.plan(3);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.gif'))
		.dest(path.join(__dirname, 'tmp'))
		.use(Imagemin.gifsicle());

	imagemin.run(function (err, files) {
		t.assert(!err);

		fs.stat(imagemin.src(), function (err, b) {
			t.assert(!err);
			t.assert(files[0].contents.length < b.size);
		});
	});
});

test('optimize a JPG', function (t) {
	t.plan(3);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.jpg'))
		.dest(path.join(__dirname, 'tmp'))
		.use(Imagemin.jpegtran());

	imagemin.run(function (err, files) {
		t.assert(!err);

		fs.stat(imagemin.src(), function (err, b) {
			t.assert(!err);
			t.assert(files[0].contents.length < b.size);
		});
	});
});

test('optimize a PNG', function (t) {
	t.plan(3);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.png'))
		.dest(path.join(__dirname, 'tmp'))
		.use(Imagemin.optipng());

	imagemin.run(function (err, files) {
		t.assert(!err);

		fs.stat(imagemin.src(), function (err, b) {
			t.assert(!err);
			t.assert(files[0].contents.length < b.size);
		});
	});
});

test('optimize a SVG', function (t) {
	t.plan(3);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.svg'))
		.dest(path.join(__dirname, 'tmp'))
		.use(Imagemin.svgo());

	imagemin.run(function (err, files) {
		t.assert(!err);

		fs.stat(imagemin.src(), function (err, b) {
			t.assert(!err);
			t.assert(files[0].contents.length < b.size);
		});
	});
});

test('output error on corrupt images', function (t) {
	t.plan(1);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test-corrupt.jpg'))
		.dest(path.join(__dirname, 'tmp'))
		.use(Imagemin.jpegtran());

	imagemin.run(function (err) {
		t.assert(err);
	});
});
