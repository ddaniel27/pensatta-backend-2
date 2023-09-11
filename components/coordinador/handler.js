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
          metricsByGroup: exercises.metrics,
          coordinator: exercises.name,
          institution: exercises.institution,
          average: {
            apropiacionValues: exercises.apropiacionValues,
            spiderValues: exercises.spiderValues,
            averageAll: exercises.averageAll
          },
          metricsAverage: exercises.met2,
          metrics: exercises.met,
        })
    })

  router.route('/grupos/:id')
    .get(async (req, res) => {
      const { id } = req.params
      const courses = await db.getResumen(id)
      res
        .status(200)
        .json({
          msg: 'all grades retrieved',
          cursos: courses
        })
    })

  router.route('/grupos/addgrupos/:id')
    .get(async (req, res) => {
      const { id } = req.params
      const courses = await db.getTeachers(id)
      res
        .status(200)
        .json({
          msg: 'all grades Profesores retrieved',
          profesores: courses
        })
    })
    .post(async (req, res) => {
      const { id } = req.params
      const { id_Profesor, nivel, curso } = req.body
      await db.addGrupos(id, id_Profesor, nivel, curso)
      res
        .status(200)
        .json({
          msg: 'all grades Profesores retrieved',
          added: true
        })
    })

  router.route('/grupos/addstudent/:id')
    .post(async (req, res) => {
      const { id } = req.params
      const {
        id_Grado,
        first_name,
        last_name,
        num_lista,
        password
      } = req.body

      await db.addStudent(id, {
        first_name,
        last_name,
        num_lista,
        id_Grado,
        password
      })
      res
        .status(200)
        .json({
          msg: 'all grades Profesores retrieved',
          added: true
        })
    })

  router.route('/grupos/deletestudent/:id')
    .put(async (req, res) => {
      const { id } = req.params
      const { id_Estudiante, id_Grado } = req.body

      await db.deleteStudent(id, id_Estudiante, id_Grado)
      res
        .status(200)
        .json({
          msg: 'all grades Profesores retrieved',
          added: true
        })
    })

  router.route('/grupos/reasignteacher/:id')
    .put(async (req, res) => {
      const { id } = req.params
      const { id_Profesor, id_Grado } = req.body
      const courses = await db.reasignTeacher(id, id_Profesor, id_Grado)
      res
        .status(200)
        .json({
          msg: 'all grades Profesores retrieved',
          profesores: courses
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
          average: exercises.averageAll,
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
          average: {
            apropiacionValues: exercises.apropiacionValues,
            spiderValues: exercises.spiderValues,
            averageAll: exercises.averageAll
          },
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
        })
    })

  router.route('/changepassword/:id')
    .put(async (req, res) => {
      const { id } = req.params
      const { id_Estudiante, value } = req.body
      await db.changePassword(id, id_Estudiante, value)
      res
        .status(200)
        .json({
          msg: 'all grades metrics retrieved',
        })
    })

  return router
}
