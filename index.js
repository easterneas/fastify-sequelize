const fp = require('fastify-plugin')
const Sequelize = require('sequelize')

const { readdirSync, statSync } = require('fs')
const { join } = require('path')

const env = process.env.NODE_ENV || 'development';

const defaultConfig = {
  dialect: 'sqlite',
  modelsPath: './models',
  name: 'models',

  username: null,
  password: null
}

async function sequelizePlugin (fastify, opts) {
  const { name, ...userConfig } = opts
  const configByEnv = userConfig[env]
  const { modelsPath, ...config } = { ...defaultConfig, ...configByEnv }

  if(!config.username) delete config.username
  if(!config.password) delete config.password

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
}

module.exports = fp(sequelizePlugin)
