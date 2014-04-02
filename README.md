# image-min [![Build Status](https://secure.travis-ci.org/kevva/image-min.png?branch=master)](http://travis-ci.org/kevva/image-min)

> Minify GIF, JPEG and PNG images seamlessly with Node.js.

## Install

```bash
npm install --save image-min
```

## Usage

```js
var fs = require('fs');
var imagemin = require('image-min');
var path = require('path');

var src = fs.createReadStream('img.gif');
var ext = path.extname(src.path);

src
    .pipe(imagemin({ ext: ext }))
    .pipe(fs.createWriteStream('img-minified' + ext));
```

## API

### imagemin(opts)

Optimize a `GIF`, `JPEG`, or `PNG` image by providing a an `ext`. Use the
options below (optionally) to configure how your images are optimized.

## Options

### ext

Type `String`  
Default: `undefined`

File extension used by imagemin to determine which optimizer to use.

### interlaced (GIF only)

Type: `Boolean`  
Default: `false`

Interlace gif for progressive rendering.

### pngquant (PNG only)

Type: `Boolean`  
Default: `false`

Whether to enable [pngquant](https://github.com/pornel/pngquant) lossy compression.

### progressive (JPEG only)

Type: `Boolean`  
Default: `false`

Lossless conversion to progressive.

## Used by

* [gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin)
* [grunt-contrib-imagemin](https://github.com/gruntjs/grunt-contrib-imagemin)

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) © [Kevin Mårtensson](http://kevinmartensson.com)
