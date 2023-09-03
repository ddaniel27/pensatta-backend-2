const connection = require('../connection')
const c = require('pbkdf2')
const crypto = require('crypto')

module.exports = {
  createNewUser: async ({
    username,
    password,
    institutionCode,
    firstName,
    lastName,
    listNumber,
    role,
  }) => {
    const passwordHash = createPassword(password)
    const query = `INSERT INTO pensatta_user (username, password, institucion_id, first_name, last_name, "numLista", role, is_superuser, is_staff, is_active, email, date_joined) SELECT $1, $2, id, $4, $5, $6, $7, $8, $9, $10, $11, $12 FROM pensatta_institucion WHERE codigo = $3`
    const values = [
      username.toUpperCase(),
      passwordHash,
      institutionCode,
      firstName,
      lastName,
      listNumber,
      role.toUpperCase(),
      false,
      false,
      true,
      '',
      new Date(Date.now()),
    ]

    const res = await connection.query(query, values)

    return {
      ...res.rows[0],
      password: undefined
    }
  }
}

const createPassword = (plainPassword) => {
  const salt = crypto.randomBytes(16).toString('base64').slice(0, 22)
  const iterations = 39000
  const passLength = 32
  const algorithm = 'sha256'
  const encrypt = 'pbkdf2'
  const encoding = 'base64'
  const hash = c.pbkdf2Sync(
    plainPassword,
    salt,
    iterations,
    passLength,
    algorithm
  ).toString(encoding)

  return `${encrypt}_${algorithm}$${iterations}$${salt}$${hash}`
}
