# image-min [![Build Status](https://travis-ci.org/kevva/image-min.svg?branch=master)](https://travis-ci.org/kevva/image-min)

> Minify GIF, JPEG and PNG images seamlessly with Node.js.

## Install

```bash
$ npm install --save image-min
```

## Usage

```js
var Imagemin = require('image-min');
var jpegtran = require('image-min').jpegtran;
var optipng = require('image-min').optipng;

var imagemin = new Imagemin()
    .source(['foo.png', 'bar.jpg'])
    .destination('dist')
    .use(jpegtran({ progressive: true }))
    .use(optipng({ optimizationLevel: 4 }))

imagemin.optimize(function (err, files) {
    console.log(files);
    // => { 'foo.png': { contents: <Buffer ff d8 ff ...> }, 'bar.jpg': { contents: <Buffer 89 50 4e ...> }}
});
```

## API

### new Imagemin()

Creates a new `Imagemin` instance.

### .use(plugin)

Add a `plugin` to the middleware stack.

### .source(files)

Set the files to be optimized.

### .destination(path)

Set the destination directory to where your files will be written.

### .optimize(cb)

Optimize your files with the given settings.

### .run(files, cb)

Run all middleware plugins on an array of files.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) © [Kevin Mårtensson](http://kevinmartensson.com)
