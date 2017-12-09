const fs = require('fs-extra')
const path = require('path')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminWebp = require('imagemin-webp')
const isJpg = require('is-jpg')
const tempfile = require('tempfile')
const m = require('../index')

const expect = require('chai').expect

describe('ImageMin', () => {
	let buf = null
	beforeEach(() => {
		buf = fs.readFileSync(path.join(__dirname, 'fixtures/fixture.jpg'))
	})
	afterEach(() => {
		fs.removeSync('output')
	})
	it('should optimize fixture.jpg', () => {
		return m(['test/fixtures/fixture.jpg', ], {
			plugins: imageminJpegtran()
		}).then((files) => {
			expect(files[0].path).to.equal(null)
			expect(files[0].data.length).to.be.lessThan(buf.length)
			expect(isJpg(files[0].data)).to.be.true
		})
	})
	it('should error on corrupt image', () => {
		return new Promise((resolve, reject) => {
			return m(['test/fixtures/fixture-corrupt.jpg'], {
				plugins: imageminJpegtran()
			}).then(reject).catch(resolve)
		})
	})
	it('should error on wrong input', () => {
		return new Promise((resolve, reject) => {
			return m('foo').then(reject).catch((reason) => {
				expect(reason.message).to.contain('array')
				resolve()
			})
		})
	})
	it('should return original file if no plugins are defined', () => {
		return m(['test/fixtures/fixture.jpg', ]).then((files) => {
			expect(files[0].path).to.equal(null)
			expect(files[0].data.length).to.equal(buf.length)
		})
	})
	it('should output files with subfolders', () => {
		return m(['test/**/*fixture.jpg', '!test/**/*-corrupt.jpg'], 'output', {
			plugins: imageminJpegtran()
		}).then((files) => {
			expect(files.length).to.equal(2)
			expect(files[0].path).to.equal(path.join('output', 'test', 'fixtures', 'fixture.jpg'))
			expect(files[1].path).to.equal(path.join('output', 'test', 'fixtures', 'folder', 'fixture.jpg'))
		})
	})
	it('should output files with subfolders and respect cwd', () => {
		return m(['**/*fixture.jpg', '!**/*-corrupt.jpg'], 'output', {
			plugins: imageminJpegtran(),
			cwd: 'test'
		}).then((files) => {
			expect(files.length).to.equal(2)
			expect(files[0].path).to.equal(path.join('output', 'fixtures', 'fixture.jpg'))
			expect(files[1].path).to.equal(path.join('output', 'fixtures', 'folder', 'fixture.jpg'))
		})
	})
	it('should output file at root level', () => {
		return m(['fixture.jpg', '!**/*-corrupt.jpg'], 'output', {
			plugins: imageminJpegtran(),
			cwd: 'test/fixtures/folder'
		}).then((files) => {
			expect(files.length).to.equal(1)
			expect(files[0].path).to.equal(path.join('output', 'fixture.jpg'))
		})
	})
	it('should set webp extension', () => {
		return m(['test/fixtures/fixture.jpg'], 'output', {
			plugins: imageminWebp()
		}).then((files) => {
			expect(files[0].path).to.contain('.webp')
		})
	})
})