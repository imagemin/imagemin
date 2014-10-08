'use strict';

var fs = require('fs');
var Imagemin = require('../');
var path = require('path');
var spawn = require('child_process').spawn;
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
		.use(Imagemin.svgo());

	imagemin.run(function (err, files) {
		t.assert(!err);

		fs.stat(imagemin.src(), function (err, b) {
			t.assert(!err);
			t.assert(files[0].contents.length < b.size);
		});
	});
});

test('optimize a JPG using buffers', function (t) {
	t.plan(3);

	fs.readFile(path.join(__dirname, 'fixtures/test.jpg'), function (err, buf) {
		t.assert(!err);

		var imagemin = new Imagemin()
			.src(buf)
			.use(Imagemin.jpegtran());

		imagemin.run(function (err, files) {
			t.assert(!err);
			t.assert(files[0].contents.length < buf.length);
		});
	});
});

test('optimize a JPG using the CLI', function (t) {
	t.plan(2);

	var cli = spawn(path.join(__dirname, '../cli.js'));
	var src = fs.createReadStream(path.join(__dirname, 'fixtures/test.jpg'));
	var len = {
		src: 0,
		dest: 0
	};

	src.on('data', function (data) {
		len.src += data.length;
	});

	cli.stdout.on('data', function (data) {
		len.dest += data.length;
	});

	cli.on('close', function (code) {
		t.assert(!code);
		t.assert(len.dest < len.src);
	});

	src.pipe(cli.stdin);
});

test('output error on corrupt images', function (t) {
	t.plan(1);

	var imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test-corrupt.jpg'))
		.use(Imagemin.jpegtran());

	imagemin.run(function (err) {
		t.assert(err);
	});
});
