'use strict';

var execFile = require('child_process').execFile;
var fs = require('fs');
var jpegtran = require('jpegtran-bin').path;
var tempfile = require('tempfile');
var path = require('path');
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
            if (path.extname(file) !== '.jpg') {
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
