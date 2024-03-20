const connection = require('../connection')

module.exports = {
  getCredentialsByUsername: async (user) => {
const query = ` SELECT u.*, COALESCE(l.value, 'es') AS language FROM pensatta_user u LEFT JOIN pensatta_languages l ON u.institucion_id = l.institucion_id WHERE u.username = $1`
    const values = [user]
    const res = await connection.query(query, values)

    if (res.rows.length === 0) return {}

    const { password } = res.rows[0]
    const [encrypt, iterations, salt, hash] = password.split('$')

    return {
      ...res.rows[0],
      password: { encrypt, iterations, salt, hash }
    }
  },
  updateLastLogin: async (userID) => {
    const query = `UPDATE pensatta_user SET last_login = $1 WHERE id = $2`
    const values = [new Date(Date.now()), userID]

    const res = await connection.query(query, values)
    return res.rows[0]
  }
}
