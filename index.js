'use strict';
const {promisify} = require('util');
const fs = require('fs');
const path = require('path');
const fileType = require('file-type');
const globby = require('globby');
const makeDir = require('make-dir');
const pPipe = require('p-pipe');
const replaceExt = require('replace-ext');
const junk = require('junk');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const handleFile = async (input, {output, plugins = []}) => {
	if (plugins && !Array.isArray(plugins)) {
		throw new TypeError('The `plugins` option should be an `Array`');
	}

	const destination = output ? path.join(output, path.basename(input)) : undefined;
	const data = await readFile(input);
	const buffer = await (plugins.length > 0 ? pPipe(...plugins)(data) : data);

	const returnValue = {
		data: buffer,
		path: (fileType(buffer) && fileType(buffer).ext === 'webp') ? replaceExt(destination, '.webp') : destination
	};

	if (!destination) {
		return returnValue;
	}

	await makeDir(path.dirname(returnValue.path));
	await writeFile(returnValue.path, returnValue.data);

	return returnValue;
};

module.exports = async (input, options = {}) => {
	if (!Array.isArray(input)) {
		throw new TypeError(`Expected an \`Array\`, got \`${typeof input}\``);
	}

	const filePaths = await globby(input, {onlyFiles: true});

	return Promise.all(
		filePaths
			.filter(filePath => junk.not(path.basename(filePath)))
			.map(async filePath => {
				try {
					return await handleFile(filePath, options);
				} catch (error) {
					error.message = `Error occurred when handling file: ${input}\n\n${error.stack}`;
					throw error;
				}
			})
	);
};

module.exports.buffer = async (input, {plugins = []} = {}) => {
	if (!Buffer.isBuffer(input)) {
		throw new TypeError(`Expected a \`Buffer\`, got \`${typeof input}\``);
	}

	if (plugins.length === 0) {
		return input;
	}

	return pPipe(...plugins)(input);
};
