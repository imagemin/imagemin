'use strict';
const fs = require('fs');
const path = require('path');
const globby = require('globby');
const mkdirp = require('mkdirp');
const pify = require('pify');
const promisePipe = require('promise.pipe');
const fsP = pify(fs);

const handleFile = (input, output, opts) => fsP.readFile(input).then(data => {
	const dest = output ? path.resolve(output, input) : null;
	const pipe = opts.plugins.length > 0 ? promisePipe(opts.plugins)(data) : Promise.resolve(data);

	return pipe
		.then(buf => {
			buf = buf.length < data.length ? buf : data;

			const ret = {
				data: buf,
				path: dest
			};

			if (!dest) {
				return ret;
			}

			return pify(mkdirp)(path.dirname(dest))
				.then(() => fsP.writeFile(dest, buf))
				.then(() => ret);
		})
		.catch(err => {
			err.message = `Error in file: ${input}\n\n${err.message}`;
			throw err;
		});
});

module.exports = (input, output, opts) => {
	if (!Array.isArray(input)) {
		return Promise.reject(new TypeError('Expected an array'));
	}

	if (typeof output === 'object') {
		opts = output;
		output = null;
	}

	opts = Object.assign({plugins: []}, opts);
	opts.plugins = opts.use || opts.plugins;

	return globby(input, {nodir: true}).then(paths => Promise.all(paths.map(x => handleFile(x, output, opts))));
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
