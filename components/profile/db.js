const connection = require('../connection')

module.exports = {
  getExercises: async (userID) => {
    const query = `SELECT * FROM pensatta_historial WHERE user_id = $1`
    const values = [userID]

    const res = await connection.query(query, values)
    return res.rows
  },
  getMetrics: async (userID) => {
    const query = `SELECT A.score, B.dimension FROM pensatta_historial A INNER JOIN pensatta_ejercicio B ON A.exercise_id = B.id WHERE A.user_id = $1`
    const values = [userID]

    const res = await connection.query(query, values)
    const [finalObjectResult, aprObjResult] = calculateMetrics(res.rows)

    return [finalObjectResult, aprObjResult]
  },
  getResumen: async (userID) => {
    const queryAverage = `SELECT "averageScore", "averageTime" FROM pensatta_calificacion WHERE usuario_id = $1`
    const queryHistorial = `SELECT COUNT(id) FROM pensatta_historial WHERE user_id = $1`
    const queryProfile = `SELECT A.last_login, B.nombre FROM pensatta_user A INNER JOIN pensatta_institucion B ON A.institucion_id = B.id WHERE A.id = $1`
    const values = [userID]

    const res = await Promise.all([
      connection.query(queryAverage, values),
      connection.query(queryHistorial, values),
      connection.query(queryProfile, values)
    ])

    const {averageScore, averageTime} = res[0].rows[0] || {averageScore: 0, averageTime: 0}
    const historial = res[1].rows[0].count || 1
    const {last_login, nombre} = res[2].rows[0]

    return {
      averageScore,
      averageTime,
      historial,
      last_login,
      nombre
    }
  }
}

function calculateMetrics(historial) {
  const finalObjectResult = {};
  const aprObjResult = { '1': 0, '2': 0, '3': 0 };

  const dimCounter = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 };

  historial.forEach(item => {
    const { score, dimension } = item;

    if (!finalObjectResult[dimension]) {
      finalObjectResult[dimension] = score;
      dimCounter[dimension] = 1;
    } else {
      const currentSum = finalObjectResult[dimension] * dimCounter[dimension];
      const newSum = currentSum + score;
      finalObjectResult[dimension] = newSum / (dimCounter[dimension] + 1);
      dimCounter[dimension]++;
    }

    if (score < 60) {
      aprObjResult['1']++;
    } else if (score < 80) {
      aprObjResult['2']++;
    } else {
      aprObjResult['3']++;
    }
  });

  for (const dimension in finalObjectResult) {
    finalObjectResult[dimension] = parseFloat(finalObjectResult[dimension].toFixed(2));
  }

  return [finalObjectResult, aprObjResult];
}
