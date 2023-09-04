const connection = require('../connection')

module.exports = {
  insertNewExercise: async ({ score, time, exercise, user_id }) => {
    const query = `INSERT INTO pensatta_historial (score, time, exercise_id, user_id, date) VALUES ($1, $2, $3, $4, $5)`
    const queryAverage = `SELECT "averageScore", "averageTime" FROM pensatta_calificacion WHERE usuario_id = $1`
    const queryHistorial = `SELECT COUNT(id) FROM pensatta_historial WHERE user_id = $1`
    const queryUpdate = `UPDATE pensatta_calificacion SET "averageScore" = $1, "averageTime" = $2 WHERE usuario_id = $3`

    const values = [score, time, exercise, user_id, new Date(Date.now())]

    const [res, qar, qhr] = await Promise.all([
      connection.query(query, values),
      connection.query(queryAverage, [user_id]),
      connection.query(queryHistorial, [user_id])
    ])

    const { averageScore, averageTime } = qar.rows[0]
    const historialCount = qhr.rows[0].count

    const newAverageScore = newAverage(averageScore, historialCount, score)
    const newAverageTime = newAverage(averageTime, historialCount, time)

    await connection.query(queryUpdate, [newAverageScore, newAverageTime, user_id])

    return res.rows[0]
  }
}

function newAverage(lastAverage, lastCount, newValue) {
  return (lastAverage * (lastCount - 1) + newValue ) / lastCount
}
