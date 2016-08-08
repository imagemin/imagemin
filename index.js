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

// Manages folder stucture
function hasFolders(globs) {
	// Creates matches for folder globs
	let matchers = globs.map(function (glob) {
		let rootmatch = glob.match(/\*{2}/);
		if (!rootmatch) {
			return null;
		}
		// Removes globs from string to get root folder
		return glob.slice(0, rootmatch.index);
	}).filter(glob => glob !== null);

	return function (input) {
		// Returns filename if no matchers
		if (matchers.length < 0) {
			return path.basename(input);
		}

		// Checks against matchers for path match and removes root path
		let rootBased = matchers.reduce(function (prev, curr) {
			let match = prev.match(curr);
			if (!match) {
				return prev;
			}
			return prev.replace(curr, '');
		}, input);
		// If no matches then returns filename else folder path from root
		return (rootBased === input) ? path.basename(input) : rootBased;
	};
}

const handleFile = (input, output, opts) => fsP.readFile(input).then(data => {
	const dest = output ? path.join(output, opts.folderCheck(input)) : null;
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
	opts.folderCheck = hasFolders(input);

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
