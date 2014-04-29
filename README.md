# imagemin [![Build Status](https://travis-ci.org/kevva/imagemin.svg?branch=master)](https://travis-ci.org/kevva/imagemin)

> Minify images seamlessly with Node.js


## Install

```bash
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
    console.log(file);
    // => { contents: <Buffer 89 50 4e ...>, mode: '0644' }
});
```


## API

### new Imagemin()

Creates a new `Imagemin` instance.

### .use(plugin)

Add a `plugin` to the middleware stack.

### .src(file)

Set the file to be optimized. Can be a `Buffer` or the path to a file.

### .dest(file)

Set the destination to where your file will be written. If you don't set any destination
the file won't be written.

### .optimize(cb)

Optimize your file with the given settings.

### .run(file, cb)

Run all middleware plugins on your file.

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

Lossy compression of SVG images.

```js
var Imagemin = require('imagemin');

var imagemin = new Imagemin()
    .use(Imagemin.svgo());
```

## CLI

```bash
$ npm install --global imagemin
```

```bash
$ imagemin --help

Usage
  $ imagemin <file>
  $ cat <file> | imagemin

Example
  $ imagemin foo.png > foo-optimized.png
  $ cat foo.png | imagemin > foo-optimized.png

Options
  -i, --interlaced                    Extract archive files on download
  -o, --optimizationLevel <number>    Path to download or extract the files to
  -p, --progressive                   Strip path segments from root when extracting
```

## License

MIT © [Kevin Mårtensson](http://kevinmartensson.com)
