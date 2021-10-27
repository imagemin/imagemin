import {Buffer} from 'node:buffer';
import {promises as fsPromises} from 'node:fs';
import {promisify} from 'node:util';
import path from 'node:path';
import fs from 'graceful-fs';
import FileType from 'file-type';
import {globby} from 'globby';
import pPipe from 'p-pipe';
import replaceExt from 'replace-ext';
import junk from 'junk';
import convertToUnixPath from 'slash';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const handleFile = async (sourcePath, {destination, preserveDirectories = false, plugins = [], basePath = ''}) => {
	if (plugins && !Array.isArray(plugins)) {
		throw new TypeError('The `plugins` option should be an `Array`');
	}

	let data = await readFile(sourcePath);
	data = await (plugins.length > 0 ? pPipe(...plugins)(data) : data);

	const {ext} = await FileType.fromBuffer(data) || {ext: path.extname(sourcePath)};
	let destinationPath = destination ? path.join(destination, path.basename(sourcePath)) : undefined;
	destinationPath = ext === 'webp' ? replaceExt(destinationPath, '.webp') : destinationPath;

	const returnValue = {
		data,
		sourcePath,
		destinationPath,
	};

	if (!destinationPath) {
		return returnValue;
	}

	if (preserveDirectories) {
		returnValue.destinationPath = path.join(destination, path.parse(sourcePath).dir.replace(basePath, ''), path.basename(destinationPath));
	}

	await fsPromises.mkdir(path.dirname(returnValue.destinationPath), {recursive: true});
	await writeFile(returnValue.destinationPath, returnValue.data);

	return returnValue;
};

export default async function imagemin(input, {glob = true, ...options} = {}) {
	if (!Array.isArray(input)) {
		throw new TypeError(`Expected an \`Array\`, got \`${typeof input}\``);
	}

	const unixFilePaths = input.map(path => convertToUnixPath(path));
	const filePaths = glob ? await globby(unixFilePaths, {onlyFiles: true}) : input;

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
			}),
	);
}

imagemin.buffer = async (input, {plugins = []} = {}) => {
	if (!Buffer.isBuffer(input)) {
		throw new TypeError(`Expected a \`Buffer\`, got \`${typeof input}\``);
	}

	if (plugins.length === 0) {
		return input;
	}

	return pPipe(...plugins)(input);
};
