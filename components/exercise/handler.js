const express = require('express')
const db = require('./db')

module.exports = () => {
  const router = express.Router()

  router.route('/')
    .post(async (req, res) => {
      const { score, time, exercise } = req.body
      const { id } = req.session.user

      if (!id) {
        return res.status(401).json({ message: 'Not logged in' })
      }
      
      try {
        const result = await db.insertNewExercise({
          score: parseFloat(score),
          time,
          exercise,
          user_id: id
        })
        res.status(200).json(result)
      } catch (e) {
        res.status(400).send(e.message)
      }
    })

  return router
}
