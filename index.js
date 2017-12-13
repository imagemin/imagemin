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

const getOutputPath = (input, output, opts, meta) => {
	const basedir = opts.basedir;
	if (!output) {
		return null;
	} else if (basedir) {
		let rel = path.relative(basedir, input);
		meta.path = rel;
		return path.join(output, rel);
	} else {
		let rel = path.basename(input);
		meta.path = rel;
		return path.join(output, rel);
	}
};

const handleFile = (input, output, opts) => fsP.readFile(input).then(data => {
	const meta = {input, output, opts, path: ''};
	const dest = opts.outputPath(input, output, opts, meta);

	if (opts.plugins && !Array.isArray(opts.plugins)) {
		throw new TypeError('The plugins option should be an `Array`');
	}

	const pipe = opts.plugins.length > 0 ? pPipe(opts.plugins)(data, meta) : Promise.resolve(data);

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
		.catch(err => {
			err.message = `Error in file: ${input}\n\n${err.message}`;
			throw err;
		});
});

module.exports = (input, output, opts) => {
	if (!Array.isArray(input)) {
		return Promise.reject(new TypeError(`Expected an \`Array\`, got \`${typeof input}\``));
	}

	if (typeof output === 'object') {
		opts = output;
		output = null;
	}

	opts = Object.assign({plugins: [], outputPath: getOutputPath}, opts);
	opts.plugins = opts.use || opts.plugins;

	if (opts.basedir) {
		input = input.map(input => path.join(opts.basedir, input));
		output = path.join(opts.basedir, output);
	}

	return globby(input, {nodir: true}).then(paths => Promise.all(paths.map(x => handleFile(x, output, opts))));
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
