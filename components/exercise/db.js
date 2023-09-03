const connection = require('../connection')

module.exports = {
  insertNewExercise: async ({ score, time, exercise, user_id }) => {
    const query = `INSERT INTO pensatta_historial (score, time, exercise_id, user_id, date) VALUES ($1, $2, $3, $4, $5)`
    const values = [score, time, exercise, user_id, new Date(Date.now())]

    const res = await connection.query(query, values)
    return res.rows[0]
  }
}
