# fastify-sequelize

This is a plugin for Fastify to integrate Sequelize deeply into your project.
Supports Sequelize up to version 6 and can play along nicely with `sequelize-cli`.

`fastify-sequelize` mostly 'borrows' the mechanics of `sequelize-cli`'s `index.js`
model file. By doing so, it will be imported immediately, making generated
Sequelize models ready to use.

## Why the fuss?

I think integrating directly into `fastify` instance is better (and cleaner, in
my opinion). And by doing so, handling routes will eliminate the need to
import `models` directory manually to each route handlers (or controllers).

## Installation

1. Install via:
   - NPM: `npm i @easterneas/fastify-sequelize`, or
   - Yarn: `yarn add @easterneas/fastify-sequelize`
2. Register this plugin:
   ```js
     fastify.register(require('@easterneas/fastify-sequelize'), options)
   ```
   where `options` contains your Sequelize configuration.
3. There is no step 3, by now you can use it through `this.models` (or
   `fastify.models`) already!

### Example

It's pretty easy to integrate the already-installed Sequelize to your Fastify project.
Let me show you how.

I will assume that your Sequelize configuration file is in a default location,
created through `sequelize-cli` package.
#### If you have Fastify project made with `fastify-cli`

```js
const fp = require('fastify-plugin')
const config = require('../config/config.json')

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@easterneas/fastify-sequelize', config))
})
```

#### If you create your Fastify project manually

```js
// app.js

const fastify = require('fastify')
const config = require('./config/config.json')

const app = fastify()

fastify
// ...
.register(require('@easterneas/fastify-sequelize'), config)
// ...
// .listen( ... )
```

## Usage

After installation, you can just use `this.models` when you handle through routes.

By default, `sequelize` and `Sequelize` are included, and it will search through
default `models` in your project's root directory.

If there is one, it will start importing and parsing Sequelize models, either
it's generated manually, or by using `sequelize-cli` package. Neat!

## Issues

If there are bugs appeared when using this plugin, feel free to create
[a new issue](https://github.com/easterneas/fastify-sequelize/issues).
But remember to always add logs and the version of the plugin before posting
issues here, and thank you for letting me know about the issues!
