# image-min [![Build Status](https://secure.travis-ci.org/kevva/image-min.png?branch=master)](http://travis-ci.org/kevva/image-min)

Minify GIF, JPEG and PNG images seamlessly with Node.js.

## Getting started

Install with [npm](https://npmjs.org/package/image-min): `npm install image-min`

## Examples

```js
var imagemin = require('image-min');

imagemin(img.gif, img-minified.gif, function () {
    console.log('GIF image minified!');
});

imagemin(img.jpg, img-minified.jpg, { progressive: true }, function () {
    console.log('JPEG image minified!');
});

imagemin(img.png, img-minified.png, { pngquant: true, optimizationLevel: 4 }, function () {
    console.log('PNG image minified!');
});
```

## API

### imagemin(src, dest, opts, cb)

Optimize a `GIF`, `JPEG`, or `PNG` image by providing a `src` and `dest`. Use the 
options below (optionally) to configure how your images are optimized.

## Options

* `interlaced` (GIF only) — Interlace gif for progressive rendering
* `optimizationLevel` (PNG only) — Select optimization level between 0 and 7
* `pngquant` (PNG only) — Whether to enable pngquant compression
* `progressive` (JPEG only) — Lossless conversion to progressive

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) (c) [Kevin Mårtensson](http://kevinmartensson.com)
