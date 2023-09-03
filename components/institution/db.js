const connection = require('../connection')

module.exports = {
  getInstitutions: async () => {
    const query = `SELECT * FROM pensatta_institucion`
    const res = await connection.query(query)

    return res.rows
  },
  insertNewInstitution: async ({ name, email, pais, provincia, ciudad, codigo }) => {
    const query = `INSERT INTO pensatta_institucion (nombre, email, pais, provincia, ciudad, codigo) VALUES ($1, $2, $3, $4, $5, $6)`
    const values = [
      name,
      email,
      pais,
      provincia,
      ciudad,
      codigo
    ]

    const res = await connection.query(query, values)
    return res.rows[0]
  },
  deleteInstitution: async (id) => {
    const query = `DELETE FROM pensatta_institucion WHERE id = $1`
    const values = [id]

    const res = await connection.query(query, values)
    return res.rows[0]
  }
}
