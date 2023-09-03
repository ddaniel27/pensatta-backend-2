require('dotenv').config()
const express = require('express')
const session = require('express-session')
const cors = require('cors')
const app = express()
const router = require('./router')

const makeApp = () => {
  app.use(express.json())
  app.use(express.urlencoded())

  app.use(cors({
    origin: true,
    credentials: true
  }))

  sessionConfig = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 3,
      sameSite: 'lax'
    }
  }

  app.use(session(sessionConfig))
  /*
  app.set('trusty proxy', 1)

  app.use(cors({
    origin: true,
    credentials: true
  }))

  app.use(session({
    secret: process.env.SESSION_SECRET,
    proxy: true,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      sameSite: 'none',
      secure: true
    }
  }))
  */

  router(app)

  return app
}

const port = process.env.PORT || 3000
const entryPoint = makeApp()

entryPoint.listen(port, () => {
  console.log(`Listening on port ${port}`)
})
