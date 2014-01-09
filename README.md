# image-min [![Build Status](https://secure.travis-ci.org/kevva/image-min.png?branch=master)](http://travis-ci.org/kevva/image-min)

Minify GIF, JPEG and PNG images seamlessly with Node.js.

## Getting started

Install with [npm](https://npmjs.org/package/image-min): `npm install image-min`

## Examples

The callback returns `size` which tells you how much optimization was done.

```js
var imagemin = require('image-min');

imagemin(img.gif, img-minified.gif, function (data) {
    console.log('Saved ' + data.size);
});

imagemin(img.jpg, img-minified.jpg, { progressive: true }, function (data) {
    console.log('Saved ' + data.size);
});

imagemin(img.png, img-minified.png, { pngquant: true, optimizationLevel: 4 }, function (data) {
    console.log('Saved ' + data.size);
});
```

## API

### imagemin(src, dest, opts, cb)

Optimize a `GIF`, `JPEG`, or `PNG` image by providing a `src` and `dest`. Use the
options below (optionally) to configure how your images are optimized.

## Options

### cache

Type: `Boolean`  
Default: `false`

Whether to cache optimized images.

### interlaced (GIF only)

Type: `Boolean`  
Default: `false`

Interlace gif for progressive rendering.

### optimizationLevel (PNG only)

Type: `Number`  
Default: `2`

Select a optimization level between 0 and 7.

### progressive (JPEG only)

Type: `Boolean`  
Default: `false`

Lossless conversion to progressive.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License) (c) [Kevin Mårtensson](http://kevinmartensson.com)
