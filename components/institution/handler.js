const express = require('express')
const db = require('./db')

module.exports = () => {
  const router = express.Router()

  router.route('/')
    .get(async (_req, res) => {
      try {
        const institutions = await db.getInstitutions()
        res.status(200).json({ institutions })
      } catch (e) {
        res.status(400).send(e.message)
      }
    })
    .post(async (req, res) => {
      const {
        name,
        email,
        country,
        province,
        city,
        institution_code,
        language = 'es'
      } = req.body

      try {
        const result = await db.insertNewInstitution({
          name,
          email,
          pais: country,
          provincia: province,
          ciudad: city,
          codigo: institution_code,
          idioma: language
        })
        res.status(200).json(result)
      }
      catch (e) {
        res.status(400).send(e.message)
      }
    })
    .delete(async (req, res) => {
      const { id } = req.body
      try {
        const result = await db.deleteInstitution(id)
        res.status(200).json(result)
      } catch (e) {
        res.status(400).send(e.message)
      }
    })

  return router
}
