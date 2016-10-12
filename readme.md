# imagemin [![Build Status](https://img.shields.io/travis/imagemin/imagemin.svg)](https://travis-ci.org/imagemin/imagemin) [![Build status](https://ci.appveyor.com/api/projects/status/wlnem7wef63k4n1t?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/imagemin)

> Minify images seamlessly


## Install

```
$ npm install --save imagemin
```


## Usage

```js
const imagemin = require('imagemin');
const imageminGm = require('imagemin-gm');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

imagemin(['images/*.{jpg,png}'], 'build/images', 'small', {
	plugins: [
		imageminGm.resize({width: 600, height: 400}),
		imageminMozjpeg(),
		imageminPngquant({quality: '65-80'})
	]
}).then(files => {
	console.log(files);
	//=> [{data: <Buffer 89 50 4e …>, path: 'build/images/foo-small.jpg'}, …]
});
```


## API

### imagemin(input, output, [output-modifier], [options])

Returns a promise for an array of objects in the format `{data: Buffer, path: String}`.

#### input

Type: `array`

Files to be optimized. See supported `minimatch` [patterns](https://github.com/isaacs/minimatch#usage).

#### output

Type: `string`

Set the destination folder to where your files will be written. If no destination is specified no files will be written.

#### output-modifier

Type: `string`

A description modifier that is added to output files. The modifier will be appended to the end of the file name, preceded by a dash, and succeeded by the extension.

#### options

##### plugins

Type: `array`

Array of [plugins](https://www.npmjs.com/browse/keyword/imageminplugin) to use.

### imagemin.buffer(buffer, [options])

Returns a promise for a buffer.

#### buffer

Type: `buffer`

The buffer to optimize.

#### options

##### plugins

Type: `array`

Array of [plugins](https://www.npmjs.com/browse/keyword/imageminplugin) to use.


## Related

- [imagemin-cli](https://github.com/imagemin/imagemin-cli) - CLI for this module
- [imagemin-app](https://github.com/imagemin/imagemin-app) - GUI app for this module
- [gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin) - Gulp plugin
- [grunt-contrib-imagemin](https://github.com/gruntjs/grunt-contrib-imagemin) - Grunt plugin


## License

MIT © [imagemin](https://github.com/imagemin)
