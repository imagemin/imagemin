'use strict';
const fs = require('fs');
const path = require('path');
const fileType = require('file-type');
const globby = require('globby');
const makeDir = require('make-dir');
const pify = require('pify');
const pPipe = require('p-pipe');
const replaceExt = require('replace-ext');

const fsP = pify(fs);

const handleFile = (input, output, opts) => fsP.readFile(input).then(data => {
	const dest = output ? path.join(output, path.basename(input)) : null;

	if (opts.plugins && !Array.isArray(opts.plugins)) {
		throw new TypeError('The plugins option should be an `Array`');
	}

	const pipe = opts.plugins.length > 0 ? pPipe(opts.plugins)(data) : Promise.resolve(data);

	return pipe
		.then(buf => {
			buf = buf.length < data.length ? buf : data;

			const ret = {
				data: buf,
				path: (fileType(buf) && fileType(buf).ext === 'webp') ? replaceExt(dest, '.webp') : dest
			};

			if (!dest) {
				return ret;
			}

			return makeDir(path.dirname(ret.path))
				.then(() => fsP.writeFile(ret.path, ret.data))
				.then(() => ret);
		})
		.catch(error => {
			error.message = `Error in file: ${input}\n\n${error.message}`;
			throw error;
		});
});

module.exports = (input, output, opts) => {
	if (typeof output === 'object') {
		opts = output;
		output = null;
	}

	opts = Object.assign({plugins: []}, opts);
	opts.plugins = opts.use || opts.plugins;

	if (Array.isArray(input)) {
		return globby(input, {onlyFiles: true}).then(paths => Promise.all(paths.map(x => handleFile(x, output, opts))));
	}

	if (typeof input === 'string') {
		return handleFile(input, output, opts);
	}

	return Promise.reject(new TypeError(`Expected an \`Array<string>\` or \`string\`, got \`${typeof input}\``));
};

module.exports.buffer = (input, opts) => {
	if (!Buffer.isBuffer(input)) {
		return Promise.reject(new TypeError(`Expected a \`Buffer\`, got \`${typeof input}\``));
	}

	opts = Object.assign({plugins: []}, opts);
	opts.plugins = opts.use || opts.plugins;

	if (opts.plugins.length === 0) {
		return Promise.resolve(input);
	}

	return pPipe(opts.plugins)(input).then(buf => (buf.length < input.length ? buf : input));
};
