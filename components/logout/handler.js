const express = require('express')

module.exports = () => {
  const router = express.Router()

  router.route('/')
    .post((req, res) => {
      try {
        req.session.user = null
        req.session.destroy()
        res.status(204).send()
      } catch(e) {
        res.status(500).send(e)
      }
    })

  return router
}
