# imagemin [![Build Status](http://img.shields.io/travis/imagemin/imagemin.svg?style=flat)](https://travis-ci.org/imagemin/imagemin) [![Build status](https://ci.appveyor.com/api/projects/status/wlnem7wef63k4n1t)](https://ci.appveyor.com/project/ShinnosukeWatanabe/imagemin)

> Minify images seamlessly


## Install

```sh
$ npm install --save imagemin
```


## Usage

```js
var Imagemin = require('imagemin');

var imagemin = new Imagemin()
	.src('images/*.{gif,jpg,png,svg}')
	.dest('build/images')
	.use(Imagemin.jpegtran({ progressive: true }));

imagemin.run(function (err, files) {
	if (err) {
		throw err;
	}
	
	console.log(files[0]);
	// => { contents: <Buffer 89 50 4e ...> }
});
```

You can use [gulp-rename](https://github.com/hparra/gulp-rename) to rename your files:

```js
var Imagemin = require('imagemin');
var rename = require('gulp-rename');

var imagemin = new Imagemin()
	.src('images/foo.png')
	.use(rename('bar.png'));
```


## API

### new Imagemin()

Creates a new `Imagemin` instance.

### .src(file)

Type: `Array|Buffer|String`

Set the files to be optimized. Takes a buffer, glob string or an array of glob strings 
as argument.

### .dest(folder)

Type: `String`

Set the destination folder to where your files will be written. If you don't set 
any destination no files will be written.

### .use(plugin)

Type: `Function`

Add a `plugin` to the middleware stack.

### .run(cb)

Type: `Function`

Optimize your files with the given settings.

#### cb(err, files, stream)

The callback will return an array of vinyl files in `files` and a Readable/Writable 
stream in `stream`.


## Plugins

The following [plugins](https://www.npmjs.org/browse/keyword/imageminplugin) are bundled with imagemin:

* [gifsicle](#gifsicle) — Compress GIF images.
* [jpegtran](#jpegtran) — Compress JPG images.
* [optipng](#optipng) — Lossless compression of PNG images.
* [pngquant](#pngquant) — Lossy compression of PNG images.
* [svgo](#svgo) — Compress SVG images.

### .gifsicle()

Compress GIF images.

```js
var Imagemin = require('imagemin');

var imagemin = new Imagemin()
	.use(Imagemin.gifsicle({ interlaced: true }));
```

### .jpegtran()

Compress JPG images.

```js
var Imagemin = require('imagemin');

var imagemin = new Imagemin()
	.use(Imagemin.jpegtran({ progressive: true }));
```

### .optipng()

Lossless compression of PNG images.

```js
var Imagemin = require('imagemin');

var imagemin = new Imagemin()
	.use(Imagemin.optipng({ optimizationLevel: 3 }));
```

### .pngquant()

Lossy compression of PNG images.

```js
var Imagemin = require('imagemin');

var imagemin = new Imagemin()
	.use(Imagemin.pngquant());
```

### .svgo()

Compress SVG images.

```js
var Imagemin = require('imagemin');

var imagemin = new Imagemin()
	.use(Imagemin.svgo());
```


## CLI

```bash
$ npm install --global imagemin
```

```sh
$ imagemin --help

Usage
  imagemin <file> <directory>
  imagemin <file> > <output>
  cat <file> | imagemin > <output>

Example
  imagemin images/* build
  imagemin foo.png > foo-optimized.png
  cat foo.png | imagemin > foo-optimized.png

Options
  -i, --interlaced                    Interlace gif for progressive rendering
  -o, --optimizationLevel <number>    Optimization level between 0 and 7
  -p, --progressive                   Lossless conversion to progressive
```


## Related

- [imagemin-app](https://github.com/imagemin/imagemin-app)
- [gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin)
- [grunt-contrib-imagemin](https://github.com/gruntjs/grunt-contrib-imagemin)


## License

MIT © [imagemin](https://github.com/imagemin)
