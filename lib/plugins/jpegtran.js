'use strict';

var execFile = require('child_process').execFile;
var fs = require('fs');
var imageType = require('image-type');
var jpegtran = require('jpegtran-bin').path;
var tempfile = require('tempfile');
var rm = require('rimraf');

/**
 * jpegtran image-min plugin
 *
 * @param {Object} opts
 * @api public
 */

module.exports = function (opts) {
    opts = opts || {};

    return function (files, imagemin, cb) {
        Object.keys(files).forEach(function (file) {
            if (imageType(files[file].contents) !== 'jpg') {
                return;
            }

            var args = ['-copy', 'none', '-optimize'];
            var data = files[file].contents;
            var src = tempfile('.jpg');
            var dest = tempfile('.jpg');

            if (opts.progressive) {
                args.push('-progressive');
            }

            fs.writeFile(src, data, function (err) {
                if (err) {
                    return cb(err);
                }

                execFile(jpegtran, args.concat(['-outfile', dest, src]), function (err) {
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
