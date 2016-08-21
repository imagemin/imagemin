import path from 'path';
import del from 'del';
import imageminJpegtran from 'imagemin-jpegtran';
import test from 'ava';
import tempfile from 'tempfile';
import m from '../index';

let tmp = null;

test.beforeEach(() => {
	tmp = tempfile();
});

test.afterEach(async () => {
	await del([tmp], {force: true});
});

test('glob one files starting at fixtures folder', async t => {
	const files = await m(['fixture.jpg'], tmp, {plugins: imageminJpegtran(), cwd: 'fixtures'});

	t.is(files.length, 1);
	t.is(files[0].path, path.join(tmp, 'fixture.jpg'));
});

test('glob another single file starting at fixtures folder', async t => {
	const files = await m(['fixture.1.jpg'], tmp, {plugins: imageminJpegtran(), cwd: 'fixtures'});

	t.is(files.length, 1);
	t.is(files[0].path, path.join(tmp, 'fixture.1.jpg'));
});

test('glob two files starting at fixtures folder', async t => {
	const files = await m(['*.jpg', '!*-corrupt.jpg'], tmp, {plugins: imageminJpegtran(), cwd: 'fixtures'});

	t.is(files.length, 2);
});

test('glob three files starting at fixtures folder', async t => {
	const files = await m(['**/*.jpg', '!*-corrupt.jpg'], tmp, {plugins: imageminJpegtran(), cwd: 'fixtures'});

	t.is(files.length, 3);
});

test('glob three files starting at test folder', async t => {
	const files = await m(['**/*.jpg', '!**/*-corrupt.jpg'], tmp, {plugins: imageminJpegtran()});

	t.is(files.length, 3);
});

test('output the file in {temp}', async t => {
	const files = await m(['**/*.jpg'], tmp, {plugins: imageminJpegtran(), cwd: 'fixtures/folder'});

	t.is(files.length, 1);
	t.is(files[0].path, path.join(tmp, 'fixture.jpg'));
});

test('output the file in {temp}/folder', async t => {
	const files = await m(['folder/**/*.jpg'], tmp, {plugins: imageminJpegtran(), cwd: 'fixtures'});

	t.is(files.length, 1);
	t.is(files[0].path, path.join(tmp, 'folder', 'fixture.jpg'));
});

test('output the file in {temp}/fixtures/folder', async t => {
	const files = await m(['fixtures/folder/**/*.jpg'], tmp, {plugins: imageminJpegtran()});

	t.is(files.length, 1);
	t.is(files[0].path, path.join(tmp, 'fixtures', 'folder', 'fixture.jpg'));
});
