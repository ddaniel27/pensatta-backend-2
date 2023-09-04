const express = require('express')
const db = require('./db')

module.exports = () => {
  const router = express.Router()

  router.route('/exercises/:id')
    .get(async (req, res) => {
      const { id } = req.params
      try {
        const history = await db.getExercises(id)
        res.status(200).json({
          msg: 'History retrieved',
          history
        })
      } catch (e) {
        res.status(400).send(e.message)
      }
    })

  router.route('/metrics/:id')
    .get(async (req, res) => {
      const { id } = req.params
      try {
        const metrics = await db.getMetrics(id)
        res.status(200).json({
          msg: 'Metrics retrieved',
          spiderValues: metrics[0],
          apropiacionValues: metrics[1],
        })
      } catch (e) {
        res.status(400).send(e.message)
      }
    })

  router.route('/resumen/:id')
    .get(async (req, res) => {
      const { id } = req.params
      try {
        const resumen = await db.getResumen(id)
        res.status(200).json({
          msg: 'Resumen retrieved',
          institution_name: resumen.nombre,
          last_login: resumen.last_login,
          resumen: {
            average_score: resumen.averageScore,
            average_time: resumen.averageTime,
            total_exercises: resumen.historial
          }
        })
      } catch (e) {
        res.status(400).send(e.message)
      }
    })

  return router
}
