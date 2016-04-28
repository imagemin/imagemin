import fs from 'fs';
import path from 'path';
import test from 'ava';
import imageminJpegtran from 'imagemin-jpegtran';
import imagemin from '../';

test.cb('optimize a file', t => {
	t.plan(1);

	const buf = fs.readFileSync(path.join(__dirname, 'fixtures/test.jpg'));

	imagemin(path.join(__dirname, 'fixtures/test.jpg'), {use: imageminJpegtran()}).then(files => {
		t.true(files[0].data.length < buf.length);
		t.end();
	});
});

test.cb('#buffer optimize a file', t => {
	t.plan(1);

	const buf = fs.readFileSync(path.join(__dirname, 'fixtures/test.jpg'));

	imagemin.buffer(buf, {use: imageminJpegtran()}).then(data => {
		t.true(data.length < buf.length);
		t.end();
	});
});

test.cb('output error on corrupt images', t => {
	t.plan(1);

	imagemin(path.join(__dirname, 'fixtures/test-corrupt.jpg'), {use: imageminJpegtran()}).catch(err => {
		t.regex(err.message, /Corrupt JPEG data/);
		t.end();
	});
});
