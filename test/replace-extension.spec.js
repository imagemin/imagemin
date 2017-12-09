'use strict'

const expect = require('chai').expect

const replaceExtension = require('../lib/util/replace-extension')

describe('ReplaceExtensions', () => {
    it('should replace a files extension', () => {
        const replacedFilename = replaceExtension('a.doc', 'pdf')
        expect(replacedFilename).to.equal('a.pdf')
    })
})