const express = require('express')
const db = require('./db')

module.exports = () => {
  const router = express.Router()

  router.route('/inicio/:id')
    .get(async (req, res) => {
      const { id } = req.params
      const exercises = await db.getStart(id)
      res
        .status(200)
        .json({
          msg: 'all grades metrics retrieved',
          metrics: Object.values(exercises.gradeMetrics).map(metric => ({
            apropiacionValues: metric.apr,
            spiderValues: metric.spider,
            nivel: metric.nivel,
            curso: metric.curso,
            idCurso: metric.idCurso
          })),
          average: {
            apropiacionValues: exercises.apropiacionValues,
            spiderValues: exercises.spiderValues,
            averageAll: exercises.averageAll
          },
          name: exercises.name,
          institution: exercises.institution
        })
    })

  router.route('/listado/:id')
    .get(async (req, res) => {
      const { id } = req.params
      const listado = await db.getListado(id)
      res
        .status(200)
        .json({
          msg: 'all grades retrieved',
          listado
        })
    })

  router.route('/resumen/:id')
    .get(async (req, res) => {
      const { id } = req.params
      const courses = await db.getResumen(id)
      res
        .status(200)
        .json({
          msg: 'all grades retrieved',
          courses
        })
    })

  router.route('/metrics/:id/:nivel')
    .get(async (req, res) => {
      const { id, nivel } = req.params
      const exercises = await db.getMetrics(id, nivel)
      res
        .status(200)
        .json({
          msg: 'all grades metrics retrieved',
          result: Object.values(exercises.eachCourse).map(metric => ({
            apropsGrado: metric.apr,
            spiderGrado: metric.spider,
            nivelGrado: metric.nivel,
            cursoGrado: metric.curso,
            idGrado: metric.idCurso
          })),
          average: {
            apropiacionValues: exercises.apr,
            spiderValues: exercises.spider,
            averageAll: exercises.averageAll
          },
          name: exercises.name,
          institution: exercises.institution
        })
    })

  router.route('/grado/:id/:grado')
    .get(async (req, res) => {
      const { id, grado } = req.params
      const exercises = await db.getGrado(id, grado)
      res
        .status(200)
        .json({
          msg: 'all grades metrics retrieved',
          infoUsuario: Object.values(exercises.gradeMetrics).map(metric => {
            const scoresObj = {}
            const aprObj = {}
            for(const key in metric.maxScore) {
              scoresObj[key] = { "1": parseFloat(metric.maxScore[key]["1"].score), "2": parseFloat(metric.maxScore[key]["2"].score), "3": parseFloat(metric.maxScore[key]["3"].score) }
              aprObj[key] = { "1": metric.maxScore[key]["1"].apr, "2": metric.maxScore[key]["2"].apr, "3": metric.maxScore[key]["3"].apr }
            }
            return {
              id: metric.id,
              username: metric.username,
              first_name: metric.first_name,
              last_name: metric.last_name,
              exercisesAprops: aprObj,
              exercisesScore: scoresObj,
              exercisesSpider: metric.spider,
              allExercisesSpider: metric.spider,
              allExercisesAprops: metric.apr,
              lastHistory: metric.lastHistory,
            }
          }),
          average: {
            apropiacionValues: exercises.apr,
            spiderValues: exercises.spider,
            averageAll: exercises.averageAll
          }
        })
    })

  return router
}
