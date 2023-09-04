const register = require('./components/register/handler')
const login = require('./components/login/handler')
const logout = require('./components/logout/handler')
const exercise = require('./components/exercise/handler')
const institution = require('./components/institution/handler')
const profile = require('./components/profile/handler')
const profesor = require('./components/profesor/handler')

module.exports = (app) => {
  app.use('/register', register())
  app.use('/login', login())
  app.use('/logout', logout())
  app.use('/exercise', exercise())
  app.use('/institution', institution())
  app.use('/profile', profile())
  app.use('/profesor', profesor())
}
