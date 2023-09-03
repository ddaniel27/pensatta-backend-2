const connection = require('../connection')

module.exports = {
  getCredentialsByUsername: async (user) => {
    const query = `SELECT * FROM pensatta_user WHERE username = $1`
    const values = [user]
    const res = await connection.query(query, values)

    if (res.rows.length === 0) return {}

    const { password } = res.rows[0]
    const [encrypt, iterations, salt, hash] = password.split('$')

    return {
      ...res.rows[0],
      password: { encrypt, iterations, salt, hash }
    }
  }
}
