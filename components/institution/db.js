const connection = require('../connection')

module.exports = {
  getInstitutions: async () => {
    const query = `SELECT i.*, COALESCE(l.value, 'es') AS language FROM pensatta_institucion i LEFT JOIN pensatta_languages l ON i.id = l.institucion_id`
    const res = await connection.query(query)

    return res.rows
  },
  insertNewInstitution: async ({ name, email, pais, provincia, ciudad, codigo, idioma }) => {
    const query = `INSERT INTO pensatta_institucion (nombre, email, pais, provincia, ciudad, codigo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`
    const values = [
      name,
      email,
      pais,
      provincia,
      ciudad,
      codigo
    ]

    const res = await connection.query(query, values)
    const institutionId = res.rows[0].id
    const insertLanguageQuery = `INSERT INTO pensatta_languages (institucion_id, value) VALUES ($1, $2)`
    const languageValues = [
      institutionId,
      idioma
    ]

    await connection.query(insertLanguageQuery, languageValues)

    return res.rows[0]
  },
  deleteInstitution: async (id) => {
    const query = `DELETE FROM pensatta_institucion WHERE id = $1`
    const values = [id]

    const res = await connection.query(query, values)
    return res.rows[0]
  }
}
