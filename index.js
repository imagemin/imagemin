import fsPromises from 'node:fs/promises';
import path from 'node:path';
import {fileTypeFromBuffer} from 'file-type';
import {globby} from 'globby';
import pPipe from 'p-pipe';
import changeFileExtension from 'change-file-extension';
import {isNotJunk} from 'junk';
import convertToUnixPath from 'slash';
import {assertUint8Array} from 'uint8array-extras';
import {isBrowser} from 'environment';
import ow from 'ow';

const handleFile = async (sourcePath, {destination, plugins = []}) => {
	ow(plugins, ow.optional.array.message('The `plugins` option should be an `Array`'));

	let data = await fsPromises.readFile(sourcePath);
	data = await (plugins.length > 0 ? pPipe(...plugins)(data) : data);

	const {ext} = await fileTypeFromBuffer(data) ?? {ext: path.extname(sourcePath)};
	let destinationPath = destination ? path.join(destination, path.basename(sourcePath)) : undefined;
	destinationPath = ext === 'webp' ? changeFileExtension(destinationPath, 'webp') : destinationPath;

	const returnValue = {
		data: new Uint8Array(data),
		sourcePath,
		destinationPath,
	};

	if (!destinationPath) {
		return returnValue;
	}

	await fsPromises.mkdir(path.dirname(returnValue.destinationPath), {recursive: true});
	await fsPromises.writeFile(returnValue.destinationPath, returnValue.data);

	return returnValue;
};

export default async function imagemin(input, {glob = true, ...options} = {}) {
	if (isBrowser) {
		throw new Error('This package does not work in the browser.');
	}

	ow(input, ow.array);

	const unixFilePaths = input.map(path => convertToUnixPath(path));
	const filePaths = glob ? await globby(unixFilePaths, {onlyFiles: true}) : input;

	return Promise.all(
		filePaths
			.filter(filePath => isNotJunk(path.basename(filePath)))
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

imagemin.buffer = async (data, {plugins = []} = {}) => {
	if (isBrowser) {
		throw new Error('This package does not work in the browser.');
	}

	assertUint8Array(data);

	if (plugins.length === 0) {
		return new Uint8Array(data);
	}

	// The `new Uint8Array` can be removed if all plugins are changed to return `Uint8Array` instead of `Buffer`.
	return new Uint8Array(await pPipe(...plugins)(data));
};
