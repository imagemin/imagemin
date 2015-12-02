import fs from 'fs';
import path from 'path';
import test from 'ava';
import Imagemin from '../';

test('expose a constructor', t => {
	t.assert(typeof Imagemin === 'function');
});

test('add a plugin to the middleware stack', t => {
	const imagemin = new Imagemin()
		.use(function noop() {});

	t.is(imagemin.streams.length, 1);
});

test('set source file', t => {
	const imagemin = new Imagemin()
		.src('test.jpg');

	t.is(imagemin._src, 'test.jpg');
});

test('set destination folder', t => {
	const imagemin = new Imagemin()
		.dest('tmp');

	t.assert(imagemin._dest === 'tmp', imagemin._dest);
});

test.cb('optimize a GIF', t => {
	t.plan(2);

	const src = fs.readFileSync(path.join(__dirname, 'fixtures/test.gif'));
	const imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.gif'))
		.use(Imagemin.gifsicle());

	imagemin.run((err, files) => {
		t.is(err, null);
		t.true(files[0].contents.length < src.length);
		t.end();
	});
});

test.cb('optimize a JPG', t => {
	t.plan(2);

	const src = fs.readFileSync(path.join(__dirname, 'fixtures/test.jpg'));
	const imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.jpg'))
		.use(Imagemin.jpegtran());

	imagemin.run((err, files) => {
		t.is(err, null);
		t.true(files[0].contents.length < src.length);
		t.end();
	});
});

test.cb('optimize a PNG', t => {
	t.plan(2);

	const src = fs.readFileSync(path.join(__dirname, 'fixtures/test.png'));
	const imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.png'))
		.use(Imagemin.optipng());

	imagemin.run((err, files) => {
		t.is(err, null);
		t.true(files[0].contents.length < src.length);
		t.end();
	});
});

test.cb('optimize a SVG', t => {
	t.plan(2);

	const src = fs.readFileSync(path.join(__dirname, 'fixtures/test.svg'));
	const imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test.svg'))
		.use(Imagemin.svgo());

	imagemin.run((err, files) => {
		t.is(err, null);
		t.true(files[0].contents.length < src.length);
		t.end();
	});
});

test.cb('optimize a JPG using buffers', t => {
	t.plan(2);

	const src = fs.readFileSync(path.join(__dirname, 'fixtures/test.jpg'));
	const imagemin = new Imagemin()
		.src(src)
		.use(Imagemin.jpegtran());

	imagemin.run((err, files) => {
		t.is(err, null);
		t.true(files[0].contents.length < src.length);
		t.end();
	});
});

test.cb('output error on corrupt images', function (t) {
	t.plan(1);

	const imagemin = new Imagemin()
		.src(path.join(__dirname, 'fixtures/test-corrupt.jpg'))
		.use(Imagemin.jpegtran());

	imagemin.run(function (err) {
		t.ok(err);
		t.end();
	});
});
