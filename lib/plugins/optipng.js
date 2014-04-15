'use strict';

var execFile = require('child_process').execFile;
var fs = require('fs');
var optipng = require('optipng-bin').path;
var tempfile = require('tempfile');
var path = require('path');
var rm = require('rimraf');

/**
 * optipng image-min plugin
 *
 * @param {Object} opts
 * @api public
 */

module.exports = function (opts) {
    opts = opts || {};

    return function (files, imagemin, cb) {
        Object.keys(files).forEach(function (file) {
            if (path.extname(file) !== '.png') {
                return;
            }

            var args = ['-strip', 'all', '-quiet', '-clobber'];
            var data = files[file].contents;
            var optimizationLevel = opts.optimizationLevel || 3;
            var src = tempfile('.png');
            var dest = tempfile('.png');

            if (typeof optimizationLevel === 'number') {
                args.push('-o', optimizationLevel);
            }

            fs.writeFile(src, data, function (err) {
                if (err) {
                    return cb(err);
                }

                execFile(optipng, args.concat(['-out', dest, src]), function (err) {
                    if (err) {
                        return cb(err);
                    }

                    fs.readFile(dest, function (err, buf) {
                        rm(src, function (err) {
                            if (err) {
                                return cb(err);
                            }

                            rm(dest, function (err) {
                                if (err) {
                                    return cb(err);
                                }

                                files[file].contents = buf;

                                cb();
                            });
                        });
                    });
                });
            });
        });
    };
};
