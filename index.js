const fp = require('fastify-plugin')
const Sequelize = require('sequelize')

const { readdirSync, statSync } = require('fs')
const { join } = require('path')

const defaultConfig = {
  dialect: 'sqlite',
  modelsPath: './models',
  name: 'models',
  autoConnect: true,

  username: null,
  password: null
}

function sequelizePlugin (fastify, opts, done) {
  // destruct name and autoConnect from opts parameter, and
  // put everything else into userConfig
  let { name, autoConnect, ...userConfig } = opts

  // this process will override the defaultConfig value with userConfig
  // and then destruct again into modelsPath and config for the rest
  const { modelsPath, ...config } = { ...defaultConfig, ...userConfig }

  if(!config.username) delete config.username
  if(!config.password) delete config.password

  // initialize Sequelize here...
  // mostly will borrow Sequelize-generated models/index.js file
  // with little modifications to conform with the module
  let db = {}
  let sequelize

  if(config.use_env_variable) sequelize = new Sequelize(process.env[config.use_env_variable], config)
  else sequelize = new Sequelize(config.database, config.username, config.password, config)

  if(statSync(modelsPath, { throwIfNoEntry: false })){
    readdirSync(modelsPath)
    .filter(file => (file.indexOf('.') !== 0) && (file.slice(-3) === '.js'))
    .forEach(file => {
      const model = require(join(process.cwd(), modelsPath, file))(sequelize, Sequelize.DataTypes)
      db[model.name] = model
    })

    Object.keys(db).forEach(modelName => {
      if(db[modelName].associate) db[modelName].associate(db)
    })
  }

  db.sequelize = sequelize
  db.Sequelize = Sequelize

  fastify.decorate(name || defaultConfig.name, db)

  db.sequelize.sync({ alter: true, logging: opts.logging || false })
  .then(() => {
    done()
  })
  .catch(err => {
    console.log(err)
    done()
  })
}

module.exports = fp(sequelizePlugin)
