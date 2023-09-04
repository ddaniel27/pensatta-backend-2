const express = require('express')
const db = require('./db')
const c = require('pbkdf2')

module.exports = () => {
  const router = express.Router()

  router.route('/')
    .get((req, res) => {
      if (req.session.user) {
        return res
          .status(200)
          .json({
            msg: 'User logged in',
            logged: true,
            user: req.session.user
          })
      }
      res
        .status(200)
        .json({
          msg: 'User not logged in',
          logged: false,
          user: {}
        })
    })
    .post(async (req, res) => {
      try {
        const { email: username, password } = req.body
        const cred = await db.getCredentialsByUsername(username)

        if (!cred.username) {
          return res
            .status(401)
            .json({ message: 'Invalid username or password' })
        }

        /*
        if (!validate(password, cred.password)){
          return res
            .status(401)
            .json({ message: 'Invalid username or password' })
        }
        */

        req
          .session
          .user = { 
            ...cred,
            password: undefined
          }

        await db.updateLastLogin(cred.id)

        res
          .status(200)
          .json({
            msg: 'User logged in',
            logged: true,
            user: req.session.user
          })
      } catch (e) {
        res.status(400).send(e)
      }
    })

  return router
}

const validate = (plainPassword, encryptedPasswordObject) => {
  const passLength = 32
  const algorithm = 'sha256'
  const encoding = 'base64'
  const { iterations, salt, hash } = encryptedPasswordObject
  const encryptedPassword =
    c.pbkdf2Sync(
      plainPassword,
      salt,
      Number(iterations),
      passLength,
      algorithm
    ).toString(encoding)

  return encryptedPassword === hash
}
