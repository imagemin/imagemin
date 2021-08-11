import fs, {promises as fsPromises} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import del from 'del';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminWebp from 'imagemin-webp';
import imageminSvgo from 'imagemin-svgo';
import isJpg from 'is-jpg';
import tempy from 'tempy';
import test from 'ava';
import imagemin from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('optimize a file', async t => {
	const buffer = await fsPromises.readFile(path.join(__dirname, 'fixture.jpg'));
	const files = await imagemin(['fixture.jpg'], {
		plugins: [imageminJpegtran()],
	});

	t.is(files[0].destinationPath, undefined);
	t.true(files[0].data.length < buffer.length);
	t.true(isJpg(files[0].data));
});

test('optimize a buffer', async t => {
	const buffer = await fsPromises.readFile(path.join(__dirname, 'fixture.jpg'));
	const data = await imagemin.buffer(buffer, {
		plugins: [imageminJpegtran()],
	});

	t.true(data.length < buffer.length);
	t.true(isJpg(data));
});

test('output error on corrupt images', async t => {
	await t.throwsAsync(imagemin(['fixture-corrupt.jpg'], {
		plugins: [imageminJpegtran()],
	}), {message: /Corrupt JPEG data/});
});

test('throw on wrong input', async t => {
	await t.throwsAsync(imagemin('foo'), {message: /Expected an `Array`, got `string`/});
	await t.throwsAsync(imagemin.buffer('foo'), {message: /Expected a `Buffer`, got `string`/});
});

test('return original file if no plugins are defined', async t => {
	const buffer = await fsPromises.readFile(path.join(__dirname, 'fixture.jpg'));
	const files = await imagemin(['fixture.jpg']);

	t.is(files[0].destinationPath, undefined);
	t.deepEqual(files[0].data, buffer);
	t.true(isJpg(files[0].data));
});

test('return original buffer if no plugins are defined', async t => {
	const buffer = await fsPromises.readFile(path.join(__dirname, 'fixture.jpg'));
	const data = await imagemin.buffer(buffer);

	t.deepEqual(data, buffer);
	t.true(isJpg(data));
});

// TODO: Fix the test.
test.failing('return processed buffer even it is a bad optimization', async t => {
	const buffer = await fsPromises.readFile(path.join(__dirname, 'fixture.svg'));
	t.false(buffer.includes('http://www.w3.org/2000/svg'));

	const data = await imagemin.buffer(buffer, {
		plugins: [
			imageminSvgo({
				plugins: [{
					addAttributesToSVGElement: {
						attributes: [{
							xmlns: 'http://www.w3.org/2000/svg',
						}],
					},
				}],
			}),
		],
	});

	t.true(data.includes('xmlns="http://www.w3.org/2000/svg"'));
	t.true(data.length > buffer.length);
});

test('output at the specified location', async t => {
	const temporary = tempy.directory();
	const destinationTemporary = tempy.directory();
	const buffer = await fsPromises.readFile(path.join(__dirname, 'fixture.jpg'));

	await fsPromises.mkdir(temporary, {recursive: true});
	await fsPromises.writeFile(path.join(temporary, 'fixture.jpg'), buffer);

	const files = await imagemin(['fixture.jpg', `${temporary}/*.jpg`], {
		destination: destinationTemporary,
		plugins: [imageminJpegtran()],
	});

	t.true(fs.existsSync(files[0].destinationPath));
	t.true(fs.existsSync(files[1].destinationPath));

	await del([temporary, destinationTemporary], {force: true});
});

test('output at the specified location when input paths contain Windows path delimiter', async t => {
	const temporary = tempy.directory();
	const destinationTemporary = tempy.directory();
	const buffer = await fsPromises.readFile(path.join(__dirname, 'fixture.jpg'));

	await fsPromises.mkdir(temporary, {recursive: true});
	await fsPromises.writeFile(path.join(temporary, 'fixture.jpg'), buffer);

	const fileNameWithWindowsPathDelimiter = `${temporary}\\*.jpg`;

	const files = await imagemin([fileNameWithWindowsPathDelimiter], {
		destination: destinationTemporary,
		plugins: [imageminJpegtran()],
	});

	t.true(fs.existsSync(files[0].destinationPath));

	await del([temporary, destinationTemporary], {force: true});
});

test('set webp ext', async t => {
	const temporary = tempy.file();
	const files = await imagemin(['fixture.jpg'], {
		destination: temporary,
		plugins: [imageminWebp()],
	});

	t.is(path.extname(files[0].destinationPath), '.webp');
	await del(temporary, {force: true});
});

test('set svg ext', async t => {
	const temporary = tempy.file();
	const files = await imagemin(['fixture.svg'], {
		destination: temporary,
		plugins: [imageminSvgo()],
	});

	t.is(path.extname(files[0].destinationPath), '.svg');
	await del(temporary, {force: true});
});

test('ignores junk files', async t => {
	const temporary = tempy.directory();
	const destinationTemporary = tempy.directory();
	const buffer = await fsPromises.readFile(path.join(__dirname, 'fixture.jpg'));

	await fsPromises.mkdir(temporary, {recursive: true});
	await fsPromises.writeFile(path.join(temporary, '.DS_Store'), '');
	await fsPromises.writeFile(path.join(temporary, 'Thumbs.db'), '');
	await fsPromises.writeFile(path.join(temporary, 'fixture.jpg'), buffer);

	await t.notThrowsAsync(imagemin([`${temporary}/*`], {
		destination: destinationTemporary,
		plugins: [imageminJpegtran()],
	}));

	t.true(fs.existsSync(path.join(destinationTemporary, 'fixture.jpg')));
	t.false(fs.existsSync(path.join(destinationTemporary, '.DS_Store')));
	t.false(fs.existsSync(path.join(destinationTemporary, 'Thumbs.db')));

	await del([temporary, destinationTemporary], {force: true});
});

test('glob option', async t => {
	const files = await imagemin(['fixture.jpg'], {
		glob: false,
		plugins: [imageminJpegtran()],
	});

	t.true(isJpg(files[0].data));
});
