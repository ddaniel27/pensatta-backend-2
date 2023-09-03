const express = require('express')
const db = require('./db')

module.exports = () => {
  const router = express.Router()

  router.route('/')
    .post(async (req, res) => {
      const {
        role,
        institution_code: institutionCode,
        password,
        first_name: firstName,
        last_name: lastName,
        list_number: listNumber,
      } = req.body

      const username = `${institutionCode}${Math.floor(Math.random() * (999 - 100) + 100)}${firstName.slice(0, 2)}${lastName.slice(0, 2)}${listNumber}`

      try {
        const user = {
          username,
          password,
          institutionCode,
          firstName,
          lastName,
          listNumber,
          role,
        }
        await db.createNewUser(user)

        user.username = user.username.toUpperCase()
        user.role = user.role.toUpperCase()
        user.password = undefined

        res.status(201).json(user)
      } catch (e) {
        res.status(400).send(e.message)
      }

    })

  return router
}
