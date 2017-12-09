const path = require('path')
const imageminJpegtran = require('imagemin-jpegtran')
const tempfile = require('tempfile')
const m = require('../index')
const expect = require('chai').expect
const fs = require('fs-extra')

describe('Imagemin', () => {
	let tmp = null	
	beforeEach(() => {
		tmp = tempfile()
	})
	afterEach(() => {
		fs.removeSync(tmp)
	})

	it('should glob on files starting at fixtures folder', () => {
		return m(['fixture.jpg'], tmp, {
			plugins: imageminJpegtran(),
			cwd: 'test/fixtures'
		}).then((files) => {
			expect(files.length).to.equal(1)
			expect(files[0].path).to.equal(path.join(tmp, 'fixture.jpg'))
		})
	})

	it('should minify another single file starting at fixtures folder', () => {
		return m(['fixture.1.jpg'], tmp, {
			plugins: imageminJpegtran(),
			cwd: 'test/fixtures'
		}).then((files) => {
			expect(files.length).to.equal(1)
			expect(files[0].path).to.equal(path.join(tmp, 'fixture.1.jpg'))
		})
	})

	it('should minify two files starting at fixtures folder', () => {
		return m(['*.jpg', '!*-corrupt.jpg'], tmp, {
			plugins: imageminJpegtran(),
			cwd: 'test/fixtures'
		}).then((files) => {
			expect(files.length).to.equal(2)
		})
	})

	it('should minify three files starting at fixtures folder', () => {
		return m(['**/*.jpg', '!*-corrupt.jpg'], tmp, {
			plugins: imageminJpegtran(),
			cwd: 'test/fixtures'
		}).then((files) => {
			expect(files.length).to.equal(3)
		})
	})

	it('should minify three files starting at test folder', () => {
		return m(['**/*.jpg', '!**/*-corrupt.jpg'], tmp, {
			plugins: imageminJpegtran()
		}).then((files) => {
			expect(files.length).to.equal(5)
		})
	})

	it('should output the file in {temp}', () => {
		return m(['**/*.jpg'], tmp, {
			plugins: imageminJpegtran(),
			cwd: 'test/fixtures/folder'
		}).then((files) => {
			expect(files.length).to.equal(1)
			expect(files[0].path).to.equal(path.join(tmp, 'fixture.jpg'))
		})
	})

	it('should output the file in {temp}/folder', () => {
		return m(['folder/**/*.jpg'], tmp, {
			plugins: imageminJpegtran(),
			cwd: 'test/fixtures'
		}).then((files) => {
			expect(files.length).to.equal(1)
			expect(files[0].path).to.equal(path.join(tmp, 'folder', 'fixture.jpg'))
		})
	})

	it('should output the file in {temp}/test/fixtures/folder', () => {
		return m(['test/fixtures/folder/**/*.jpg'], tmp, {
			plugins: imageminJpegtran()
		}).then((files) => {
			expect(files.length).to.equal(1)
			expect(files[0].path).to.equal(path.join(tmp, 'test', 'fixtures', 'folder', 'fixture.jpg'))
		})
	})
})
