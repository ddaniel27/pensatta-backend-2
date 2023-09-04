const register = require('./components/register/handler')
const login = require('./components/login/handler')
const logout = require('./components/logout/handler')
const exercise = require('./components/exercise/handler')
const institution = require('./components/institution/handler')
const profile = require('./components/profile/handler')
const profesor = require('./components/profesor/handler')
const coordinador = require('./components/coordinador/handler')

module.exports = (app) => {
  app.use('/api/register', register())
  app.use('/api/login', login())
  app.use('/api/logout', logout())
  app.use('/api/exercise', exercise())
  app.use('/api/institution', institution())
  app.use('/api/profile', profile())
  app.use('/api/profesor', profesor())
  app.use('/api/coordinacion', coordinador())
}
