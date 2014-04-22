'use strict';

var execFile = require('child_process').execFile;
var fs = require('fs');
var gifsicle = require('gifsicle').path;
var imageType = require('image-type');
var tempfile = require('tempfile');
var rm = require('rimraf');

/**
 * gifsicle image-min plugin
 *
 * @param {Object} opts
 * @api public
 */

module.exports = function (opts) {
    opts = opts || {};

    return function (file, imagemin, cb) {
        if (imageType(file.contents) !== 'gif') {
            return cb();
        }

        var args = ['-w'];
        var src = tempfile('.gif');
        var dest = tempfile('.gif');

        if (opts.interlaced) {
            args.push('--interlace');
        }

        fs.writeFile(src, file.contents, function (err) {
            if (err) {
                return cb(err);
            }

            execFile(gifsicle, args.concat(['-o', dest, src]), function (err) {
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

                            file.contents = buf;

                            cb();
                        });
                    });
                });
            });
        });
    };
};
