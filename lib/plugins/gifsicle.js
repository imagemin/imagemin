'use strict';

var execFile = require('child_process').execFile;
var fs = require('fs');
var gifsicle = require('gifsicle').path;
var tempfile = require('tempfile');
var path = require('path');
var rm = require('rimraf');

/**
 * gifsicle image-min plugin
 *
 * @param {Object} opts
 * @api public
 */

module.exports = function (opts) {
    opts = opts || {};

    return function (files, imagemin, cb) {
        Object.keys(files).forEach(function (file) {
            if (path.extname(file) !== '.gif') {
                return;
            }

            var args = ['-w'];
            var data = files[file].contents;
            var src = tempfile('.gif');
            var dest = tempfile('.gif');

            if (opts.interlaced) {
                args.push('--interlace');
            }

            fs.writeFile(src, data, function (err) {
                if (err) {
                    return cb(err);
                }

                execFile(gifsicle, args.concat(['-o', dest, src]), function (err) {
                    if (err) {
                        return cb(err);
                    }

                    fs.readFile(dest, function (err, buf) {
                        rm.sync(src);
                        rm.sync(dest);

                        files[file].contents = buf;

                        cb();
                    });
                });
            });
        });
    };
};
