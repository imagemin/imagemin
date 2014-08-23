# imagemin [![Build Status](https://travis-ci.org/imagemin/imagemin.svg?branch=master)](https://travis-ci.org/imagemin/imagemin)

> Minify images seamlessly with Node.js


## Install

```sh
$ npm install --save imagemin
```


## Usage

```js
var Imagemin = require('imagemin');

var imagemin = new Imagemin()
	.src('foo.jpg')
	.dest('foo-optimized.jpg')
	.use(Imagemin.jpegtran({ progressive: true }));

imagemin.optimize(function (err, file) {
	if (err) {
		throw err;
	}
	
	console.log(file);
	// => { contents: <Buffer 89 50 4e ...>, mode: '0644' }
});
```


## API

### new Imagemin()

Creates a new `Imagemin` instance.

### .src(file)

Set the file to be optimized. Can be a `Buffer` or the path to a file.

### .dest(file)

Set the destination to where your file will be written. If you don't set any destination
the file won't be written.

### .use(plugin)

Add a `plugin` to the middleware stack.

### .optimize(cb)

Optimize your file with the given settings.

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
  $ imagemin <file> <directory>
  $ imagemin <file> > <output>
  $ cat <file> | imagemin > <output>

Example
  $ imagemin images/* build
  $ imagemin foo.png > foo-optimized.png
  $ cat foo.png | imagemin > foo-optimized.png

Options
  -i, --interlaced                    Interlace gif for progressive rendering
  -o, --optimizationLevel <number>    Select an optimization level between 0 and 7
  -p, --progressive                   Lossless conversion to progressive
```


## Related

- [imagemin-app](https://github.com/imagemin/imagemin-app)
- [gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin)
- [grunt-contrib-imagemin](https://github.com/gruntjs/grunt-contrib-imagemin)


## License

MIT © [imagemin](https://github.com/imagemin)
