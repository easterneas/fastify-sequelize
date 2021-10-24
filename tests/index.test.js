const plugin = require('..')
const fastify = require('fastify')
const { exec: execCallback } = require('child_process')
const { promisify } = require('util')
const exec = promisify(execCallback)

async function initializeApp (f, opts) {
  const app = f()

  await app.register(plugin, { storage: './data.sqlite', ...opts })

  return app
}

test(
  'Sequelize should run nicely as Fastify plugin',
  async function () {
    const app = await initializeApp(fastify)

    expect(Object.keys(app.models)).toContain('Sequelize')
    expect(Object.keys(app.models)).toContain('sequelize')

    await exec('rm -rf ./data.sqlite')
  }
)

test(
  'Sequelize should be able to load models generated through sequelize-cli',
  function () {
    let sequelize, Movie

    return exec(`
      mkdir models migrations;
      npx sequelize-cli \
      model:create \
      --name Movie \
      --attributes name:string,genre:string \
      --force;
    `)
    .then(_ => initializeApp(fastify, { storage: './model.sqlite' }))
    .then(app => {
      sequelize = app.models.sequelize
      Movie = app.models.Movie

      return app.ready()
    })
    .then(_ => Movie.create({
      name: 'The Async Adventures of Dr. Ed',
      genre: 'Adventure'
    }))
    .then(_ => Movie.findOne({ name: 'The Async Adventures of Dr. Ed' }))
    .then(movie => {
      const columns = Object.keys(JSON.parse(JSON.stringify(movie)))
      console.log(columns)

      expect(columns).toContain('id')
      expect(columns).toContain('name')
      expect(columns).toContain('genre')
      expect(columns).toContain('createdAt')
      expect(columns).toContain('updatedAt')

      return sequelize.close()
    })
    .catch(console.trace)
    .finally(_ => {
      exec('rm -rf ./model.sqlite')
      exec('rm -rf ./models ./migrations')
    })
  }
)

test(
  'The app should be able to do a query with self-defined model',
  async function () {
    const app = await initializeApp(fastify)
    const { sequelize, Sequelize } = app.models

    app.ready(async function () {
      const Movie = sequelize.define('movies', {
        name: Sequelize.STRING,
        genre: Sequelize.STRING
      }, {
        logging: false
      })

      await Movie.sync({ force: true })

      const newMovie = JSON.parse(
        JSON.stringify(
          await Movie.create({
            name: 'The Async Adventures of Dr. Ed',
            genre: 'Adventure'
          }, { logging: false })
        )
      )

      expect(Object.keys(newMovie)).toContain('id')
      expect(Object.keys(newMovie)).toContain('name')
      expect(Object.keys(newMovie)).toContain('genre')
      expect(Object.keys(newMovie)).toContain('createdAt')
      expect(Object.keys(newMovie)).toContain('updatedAt')

      await sequelize.close()

      await exec('rm -rf ./data.sqlite')
    })
  }
)

test(
  'Sequelize should be able to close the connection',
  async function () {
    const app = await initializeApp(fastify)
    const { sequelize } = app.models

    app.ready(async function () {
      expect(await sequelize.close()).toEqual(undefined)

      await exec('rm -rf ./data.sqlite')
    })
  }
)
