import {promisify} from 'util';
import path from 'path';
import fs from 'graceful-fs';
import {promises as fsPromises} from 'fs';
import FileType from 'file-type';
import globby from 'globby';
import pPipe from 'p-pipe';
import replaceExt from 'replace-ext';
import junk from 'junk';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const handleFile = async (sourcePath, {destination, plugins = []}) => {
	if (plugins && !Array.isArray(plugins)) {
		throw new TypeError('The `plugins` option should be an `Array`');
	}

	let data = await readFile(sourcePath);
	data = await (plugins.length > 0 ? pPipe(...plugins)(data) : data);

	const {ext} = await FileType.fromBuffer(data);
	let destinationPath = destination ? path.join(destination, path.basename(sourcePath)) : undefined;
	destinationPath = ext === 'webp' ? replaceExt(destinationPath, '.webp') : destinationPath;

	const returnValue = {
		data,
		sourcePath,
		destinationPath
	};

	if (!destinationPath) {
		return returnValue;
	}

	await fsPromises.mkdir(path.dirname(returnValue.destinationPath), {recursive: true});
	await writeFile(returnValue.destinationPath, returnValue.data);

	return returnValue;
};

export default async function imagemin(input, {glob = true, ...options} = {}) {
	if (!Array.isArray(input)) {
		throw new TypeError(`Expected an \`Array\`, got \`${typeof input}\``);
	}

	const filePaths = glob ? await globby(input, {onlyFiles: true}) : input;

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
