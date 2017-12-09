## image-2-min

Image minifier that respects folder structure.. :)

[![Build Status](https://travis-ci.org/stfsy/node-image-2-min.svg)](https://travis-ci.org/stfsy/node-image-2-min)
[![Dependency Status](https://img.shields.io/david/stfsy/image-2-min.svg)](https://github.com/stfsy/node-image-2-min/blob/master/package.json)
[![DevDependency Status](https://img.shields.io/david/dev/stfsy/image-2-min.svg)](https://github.com/stfsy/node-image-2-min/blob/master/package.json)
[![Npm downloads](https://img.shields.io/npm/dm/image-2-min.svg)](https://www.npmjs.com/package/node-image-2-min)
[![Npm Version](https://img.shields.io/npm/v/image-2-min.svg)](https://www.npmjs.com/package/node-image-2-min)
[![Git tag](https://img.shields.io/github/tag/stfsy/node-image-2-min.svg)](https://github.com/stfsy/node-image-2-min/releases)
[![Github issues](https://img.shields.io/github/issues/stfsy/node-image-2-min.svg)](https://github.com/stfsy/node-image-2-min/issues)
[![License](https://img.shields.io/npm/l/image-2-min.svg)](https://github.com/stfsy/node-image-2-min/blob/master/LICENSE)

## Install

```
$ npm install --save image-2-min
```


## Usage

```js
const imagemin = require('image-2-min');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

imagemin(['images/*.{jpg,png}'], 'build/images', {
	plugins: [
		imageminMozjpeg(),
		imageminPngquant({quality: '65-80'})
	]
}).then(files => {
	console.log(files);
	//=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo.jpg'}, …]
});
```


## API

### imagemin(input, output, [options])

Returns a promise for an array of objects in the format `{data: Buffer, path: String}`.

#### input

Type: `array`

Files to be optimized. See supported `minimatch` [patterns](https://github.com/isaacs/minimatch#usage).

#### output

Type: `string`

Set the destination folder to where your files will be written. If no destination is specified no files will be written.

#### options

##### plugins

Type: `array`

Array of [plugins](https://www.npmjs.com/browse/keyword/imageminplugin) to use.

### imagemin.buffer(buffer, [options])

Returns a promise for a buffer.

#### buffer

Type: `buffer`

The buffer to optimize.

### cwd

Type: `string`

The working directoy for image lookups.
## Related

- [imagemin-cli](https://github.com/imagemin/imagemin-cli) - CLI for this module
- [imagemin-app](https://github.com/imagemin/imagemin-app) - GUI app for this module
- [gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin) - Gulp plugin
- [grunt-contrib-imagemin](https://github.com/gruntjs/grunt-contrib-imagemin) - Grunt plugin


## License

MIT © [imagemin](https://github.com/imagemin)
