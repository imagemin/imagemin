import {promisify} from 'util';
import fs from 'fs';
import path from 'path';
import del from 'del';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminWebp from 'imagemin-webp';
import imageminSvgo from 'imagemin-svgo';
import isJpg from 'is-jpg';
import makeDir from 'make-dir';
import tempy from 'tempy';
import test from 'ava';
import imagemin from '.';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

test('optimize a file', async t => {
	const buffer = await readFile(path.join(__dirname, 'fixture.jpg'));
	const files = await imagemin(['fixture.jpg'], {
		plugins: [imageminJpegtran()]
	});

	t.is(files[0].destinationPath, undefined);
	t.true(files[0].data.length < buffer.length);
	t.true(isJpg(files[0].data));
});

test('optimize a buffer', async t => {
	const buffer = await readFile(path.join(__dirname, 'fixture.jpg'));
	const data = await imagemin.buffer(buffer, {
		plugins: [imageminJpegtran()]
	});

	t.true(data.length < buffer.length);
	t.true(isJpg(data));
});

test('output error on corrupt images', async t => {
	await t.throwsAsync(imagemin(['fixture-corrupt.jpg'], {
		plugins: [imageminJpegtran()]
	}), /Corrupt JPEG data/);
});

test('throw on wrong input', async t => {
	await t.throwsAsync(imagemin('foo'), /Expected an `Array`, got `string`/);
	await t.throwsAsync(imagemin.buffer('foo'), /Expected a `Buffer`, got `string`/);
});

test('return original file if no plugins are defined', async t => {
	const buffer = await readFile(path.join(__dirname, 'fixture.jpg'));
	const files = await imagemin(['fixture.jpg']);

	t.is(files[0].destinationPath, undefined);
	t.deepEqual(files[0].data, buffer);
	t.true(isJpg(files[0].data));
});

test('return original buffer if no plugins are defined', async t => {
	const buffer = await readFile(path.join(__dirname, 'fixture.jpg'));
	const data = await imagemin.buffer(buffer);

	t.deepEqual(data, buffer);
	t.true(isJpg(data));
});

test('return processed buffer even it is a bad optimization', async t => {
	const buffer = await readFile(path.join(__dirname, 'fixture.svg'));
	t.false(buffer.includes('http://www.w3.org/2000/svg'));

	const data = await imagemin.buffer(buffer, {
		plugins: [
			imageminSvgo({
				plugins: [{
					addAttributesToSVGElement: {
						attributes: [{
							xmlns: 'http://www.w3.org/2000/svg'
						}]
					}
				}]
			})
		]
	});

	t.true(data.includes('xmlns="http://www.w3.org/2000/svg"'));
	t.true(data.length > buffer.length);
});

test('output at the specified location', async t => {
	const temp = tempy.directory();
	const destinationTemp = tempy.directory();
	const buffer = await readFile(path.join(__dirname, 'fixture.jpg'));

	await makeDir(temp);
	await writeFile(path.join(temp, 'fixture.jpg'), buffer);

	const files = await imagemin(['fixture.jpg', `${temp}/*.jpg`], {
		destination: destinationTemp,
		plugins: [imageminJpegtran()]
	});

	t.true(fs.existsSync(files[0].destinationPath));
	t.true(fs.existsSync(files[1].destinationPath));

	await del([temp, destinationTemp], {force: true});
});

test('set webp ext', async t => {
	const temp = tempy.file();
	const files = await imagemin(['fixture.jpg'], {
		destination: temp,
		plugins: [imageminWebp()]
	});

	t.is(path.extname(files[0].destinationPath), '.webp');
	await del(temp, {force: true});
});

test('ignores junk files', async t => {
	const temp = tempy.directory();
	const destinationTemp = tempy.directory();
	const buffer = await readFile(path.join(__dirname, 'fixture.jpg'));

	await makeDir(temp);
	await writeFile(path.join(temp, '.DS_Store'), '');
	await writeFile(path.join(temp, 'Thumbs.db'), '');
	await writeFile(path.join(temp, 'fixture.jpg'), buffer);

	await t.notThrowsAsync(imagemin([`${temp}/*`], {
		destination: destinationTemp,
		plugins: [imageminJpegtran()]
	}));

	t.true(fs.existsSync(path.join(destinationTemp, 'fixture.jpg')));
	t.false(fs.existsSync(path.join(destinationTemp, '.DS_Store')));
	t.false(fs.existsSync(path.join(destinationTemp, 'Thumbs.db')));

	await del([temp, destinationTemp], {force: true});
});

test('glob option', async t => {
	const files = await imagemin(['fixture.jpg'], {
		glob: false,
		plugins: [imageminJpegtran()]
	});

	t.true(isJpg(files[0].data));
});
