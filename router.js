const register = require('./components/register/handler')
const login = require('./components/login/handler')
const logout = require('./components/logout/handler')

module.exports = (app) => {
  app.use('/register', register())
  app.use('/login', login())
  app.use('/logout', logout())
}
