'use strict'

module.exports = (path, newExtension) => {
    const index = path.lastIndexOf('.')
    const filenname = path.substring(0, path.lastIndexOf('.'))
    return filenname + '.' + newExtension
}