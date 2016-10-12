'use strict';
const fs = require('fs');
const path = require('path');
const fileType = require('file-type');
const globby = require('globby');
const mkdirp = require('mkdirp');
const pify = require('pify');
const promisePipe = require('promise.pipe');
const replaceExt = require('replace-ext');

const fsP = pify(fs);

const handleFile = (input, output, modifier, opts) => fsP.readFile(input).then(data => {
	const filename = modifier ? path.basename(input).replace(/(\.\w+)$/,
		(match) => '-' + modifier + match
	) : path.basename(input);
	const dest = output ? path.join(output, filename) : null;
	const pipe = opts.plugins.length > 0 ? promisePipe(opts.plugins)(data) : Promise.resolve(data);

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

			return pify(mkdirp)(path.dirname(ret.path))
				.then(() => fsP.writeFile(ret.path, ret.data))
				.then(() => ret);
		})
		.catch(err => {
			err.message = `Error in file: ${input}\n\n${err.message}`;
			throw err;
		});
});

module.exports = (input, output, modifier, opts) => {
	if (!Array.isArray(input)) {
		return Promise.reject(new TypeError('Expected an array'));
	}

	if (typeof output === 'object') {
		opts = output;
		output = null;
	}

	if (typeof modifier === 'object') {
		opts = modifier;
		modifier = null;
	}

	opts = Object.assign({plugins: []}, opts);
	opts.plugins = opts.use || opts.plugins;

	return globby(input, {nodir: true}).then(paths => Promise.all(paths.map(x => handleFile(x, output, modifier, opts))));
};

module.exports.buffer = (input, opts) => {
	if (!Buffer.isBuffer(input)) {
		return Promise.reject(new TypeError('Expected a buffer'));
	}

	opts = Object.assign({plugins: []}, opts);
	opts.plugins = opts.use || opts.plugins;

	const pipe = opts.plugins.length > 0 ? promisePipe(opts.plugins)(input) : Promise.resolve(input);

	return pipe.then(buf => buf.length < input.length ? buf : input);
};
