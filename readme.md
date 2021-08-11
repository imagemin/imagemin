# imagemin

> Minify images seamlessly

<br>

---

<div align="center">
	<p>
		<p>
			<sup>
				<a href="https://github.com/sponsors/sindresorhus">Sindre Sorhus' open source work is supported by the community</a>
			</sup>
		</p>
		<sup>Special thanks to:</sup>
		<br>
		<br>
		<a href="https://standardresume.co/tech">
			<img src="https://sindresorhus.com/assets/thanks/standard-resume-logo.svg" width="180">
		</a>
		<br>
		<br>
		<br>
		<a href="https://doppler.com/?utm_campaign=github_repo&utm_medium=referral&utm_content=imagemin&utm_source=github">
			<div>
				<img src="https://dashboard.doppler.com/imgs/logo-long.svg" width="240" alt="Doppler">
			</div>
			<b>All your environment variables, in one place</b>
			<div>
				<span>Stop struggling with scattered API keys, hacking together home-brewed tools,</span>
				<br>
				<span>and avoiding access controls. Keep your team and servers in sync with Doppler.</span>
			</div>
		</a>
		<br>
		<a href="https://strapi.io/?ref=sindresorhus">
			<div>
				<img src="https://sindresorhus.com/assets/thanks/strapi-logo-white-bg.png" width="200" alt="Strapi">
			</div>
			<b>Strapi is the leading open-source headless CMS.</b>
			<div>
				<sup>It’s 100% JavaScript, fully customizable, and developer-first.</sup>
			</div>
		</a>
	</p>
</div>

---

<br>

## Install

```
$ npm install imagemin
```

## Usage

```js
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';

const files = await imagemin(['images/*.{jpg,png}'], {
	destination: 'build/images',
	plugins: [
		imageminJpegtran(),
		imageminPngquant({
			quality: [0.6, 0.8]
		})
	]
});

console.log(files);
//=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
```

## API

### imagemin(input, options?)

Returns `Promise<object[]>` in the format `{data: Buffer, sourcePath: string, destinationPath: string}`.

#### input

Type: `string[]`

File paths or [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).

#### options

Type: `object`

##### destination

Type: `string`

Set the destination folder to where your files will be written. If no destination is specified, no files will be written.

##### plugins

Type: `Array`

[Plugins](https://www.npmjs.com/browse/keyword/imageminplugin) to use.

##### glob

Type: `boolean`\
Default: `true`

Enable globbing when matching file paths.

### imagemin.buffer(buffer, options?)

Returns `Promise<Buffer>`.

#### buffer

Type: `Buffer`

Buffer to optimize.

#### options

Type: `object`

##### plugins

Type: `Array`

[Plugins](https://www.npmjs.com/browse/keyword/imageminplugin) to use.

## Related

- [imagemin-cli](https://github.com/imagemin/imagemin-cli) - CLI for this module
- [imagemin-app](https://github.com/imagemin/imagemin-app) - GUI app for this module
- [gulp-imagemin](https://github.com/sindresorhus/gulp-imagemin) - Gulp plugin
- [grunt-contrib-imagemin](https://github.com/gruntjs/grunt-contrib-imagemin) - Grunt plugin
