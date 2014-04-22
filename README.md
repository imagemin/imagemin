# image-min [![Build Status](https://travis-ci.org/kevva/image-min.svg?branch=master)](https://travis-ci.org/kevva/image-min)

> Minify images seamlessly with Node.js.

## Install

```bash
$ npm install --save image-min
```

## Usage

```js
var Imagemin = require('image-min');
var jpegtran = require('image-min').jpegtran;

var imagemin = new Imagemin()
    .src('foo.jpg')
    .dest('foo-optimized.jpg')
    .use(jpegtran({ progressive: true }));

imagemin.optimize(function (err, file) {
    console.log(file);
    // => { contents: <Buffer 89 50 4e ...>, mode: '0644', origSize: 50986, destSize: 46987 }
});
```

## API

### new Imagemin()

Creates a new `Imagemin` instance.

### .use(plugin)

Add a `plugin` to the middleware stack.

### .src(file)

Set the file to be optimized. Could be a `Buffer` or the path to a file.

### .dest(file)

Set the destination to where your file will be written. If you don't set any destination
the file won't be written.

### .optimize(cb)

Optimize your file with the given settings.

### .run(file, cb)

Run all middleware plugins on your file.

## Plugins

The follwing plugins are bundled with image-min:

* [gifsicle](#gifsicle) — Compress GIF images.
* [jpegtran](#jpegtran) — Compress JPG images.
* [optipng](#optipng) — Lossless compression of PNG images.
* [pngquant](#pngquant) — Lossy compression of PNG images.

### .gifsicle()

Compress GIF images.

```js
var Imagemin = require('image-min');
var gifsicle = require('image-min').gifsicle;

var imagemin = new Imagemin()
    .use(gifsicle({ interlaced: true }));
```

### .jpegtran()

Compress JPG images.

```js
var Imagemin = require('image-min');
var jpegtran = require('image-min').jpegtran;

var imagemin = new Imagemin()
    .use(jpegtran({ progressive: true }));
```

### .optipng()

Lossless compression of PNG images.

```js
var Imagemin = require('image-min');
var optipng = require('image-min').optipng;

var imagemin = new Imagemin()
    .use(optipng({ optimizationLevel: 3 }));
```

### .pngquant()

Lossy compression of PNG images.

```js
var Imagemin = require('image-min');
var pngquant = require('image-min').pngquant;

var imagemin = new Imagemin()
    .use(pngquant());
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) © [Kevin Mårtensson](http://kevinmartensson.com)
