const connection = require('../connection')
const c = require('pbkdf2')
const crypto = require('crypto')

module.exports = {
  changePassword: async (id, id_Estudiante, password) => {
    const updatePassword = `
    UPDATE pensatta_user
    SET password = $3
    WHERE id = $1 AND institucion_id = (SELECT institucion_id FROM pensatta_user WHERE id = $2);
    `
    const values = [id_Estudiante, id, createPassword(password)]

    await connection.query(updatePassword, values)
  },
  getGrado: async (id, grado) => {
    const getMetricsByGradeID = `
    SELECT
        C.username,
        C.first_name,
        C.last_name,
        C.id AS student_id,
        H.score,
        H.exercise_id,
        K.dimension
    FROM
        pensatta_user C
    INNER JOIN
        pensatta_grado_estudiantes B
    ON
        C.id = B.student_id
    INNER JOIN
        pensatta_grado A
    ON
        B.grado_id = A.id
    INNER JOIN
        pensatta_historial H
    ON
        C.id = H.user_id
    INNER JOIN
        pensatta_ejercicio K
    ON
        H.exercise_id = K.id
    WHERE
        A.institucion_id = (SELECT institucion_id FROM pensatta_user WHERE id = $1) AND A.id = $2
    ORDER BY
      H.date DESC;
    `
    const values = [id, grado]

    const res = await Promise.all([
      connection.query(getMetricsByGradeID, values),
    ])

    const gradeSpiderAndAprObject = calculateMetricsByStudentID(res[0].rows)

    return {
      gradeMetrics: gradeSpiderAndAprObject,
    }
  },
  getMetrics: async (id, nivel) => {
    const queryAverageAll = `SELECT "averageScore" FROM pensatta_calificacion`

    const profesorInfoQuery = `
    SELECT
      A.first_name,
      A.last_name,
      B.nombre
    FROM
      pensatta_user A
    INNER JOIN
      pensatta_institucion B
    ON
      A.institucion_id = B.id
    WHERE
      A.id = $1;
    `
    const getMetricsByGradeID = `
    SELECT
        A.nivel,
        A.curso,
        A.id AS a_id,
        H.score,
        K.dimension
    FROM
        pensatta_user C
    INNER JOIN
        pensatta_grado_estudiantes B
    ON
        C.id = B.student_id
    INNER JOIN
        pensatta_grado A
    ON
        B.grado_id = A.id
    INNER JOIN
        pensatta_historial H
    ON
        C.id = H.user_id
    INNER JOIN
        pensatta_ejercicio K
    ON
        H.exercise_id = K.id
    WHERE
        A.institucion_id = (SELECT institucion_id FROM pensatta_user WHERE id = $1) AND A.nivel = $2;
    `
    const values = [id, nivel]

    const res = await Promise.all([
      connection.query(getMetricsByGradeID, values),
      // connection.query(studentsByProfesorID),
      connection.query(queryAverageAll),
      connection.query(profesorInfoQuery, [id])
    ])

    const eachCourse = calculateMetricsByCourseAndLevel(res[0].rows)
    // const [spider, apr] = calculateMetrics(res[1].rows)
    const averageAll = res[1].rows.length > 0 ? averageOfList(res[1].rows) : 0

    return {
      eachCourse,
      // spider,
      // apr,
      averageAll,
      name: `${res[2].rows[0].first_name} ${res[2].rows[0].last_name}`,
      institution: res[2].rows[0].nombre
    }
  },
  reasignTeacher: async (id, profesor_id, id_Grado) => {
    const query = `
    UPDATE pensatta_grado
    SET profesor_id = $2
    WHERE id = $1;
    `
    const values = [id_Grado, profesor_id]

    const res = await Promise.all([
      connection.query(query, values),
    ])

    return res[0].rows
  },
  addStudent: async (id, {
    id_Grado,
    first_name,
    last_name,
    num_lista,
    password,
  }) => {
    const query = `
    SELECT
      A.codigo
    FROM
      pensatta_institucion A
    INNER JOIN
      pensatta_user B
    ON
      A.id = B.institucion_id
    WHERE
      B.id = $1;
    `
    const res1 = await connection.query(query, [id])
      const username = `${res1.rows[0].codigo}${Math.floor(Math.random() * (999 - 100) + 100)}${first_name.slice(0, 2).toUpperCase()}${last_name.slice(0, 2).toUpperCase()}${num_lista}`

    const query1 = `
    INSERT INTO pensatta_user (username, password, institucion_id, first_name, last_name, "numLista", role, is_superuser, is_staff, is_active, email, date_joined)
    SELECT $2, $3, institucion_id, $4, $5, $6, $7, $8, $9, $10, $11, $12 FROM pensatta_grado WHERE id = $1 RETURNING id;
    `
    const query2 = `
    INSERT INTO pensatta_grado_estudiantes (grado_id, student_id)
    VALUES ($1, $2);
    `
    const values = [
      id,
      username,
      createPassword(password),
      first_name,
      last_name,
      num_lista,
      'STUDENT',
      false,
      false,
      true,
      '',
      new Date(Date.now())
    ]

    const res = await Promise.all([
      connection.query(query1, values),
    ])
    const res2 = await Promise.all([
      connection.query(query2, [id_Grado, res[0].rows[0].id]),
    ])

    const studentId = res[0].rows[0].id

    return studentId
  },
  addGrupos: async (id, profesor_id, nivel, curso) => {
    const query = `
    INSERT INTO pensatta_grado (institucion_id, profesor_id, nivel, curso)
    SELECT institucion_id, $2, $3, $4 FROM pensatta_user WHERE id = $1;
    `
    const values = [id, profesor_id, nivel, curso]

    const res = await Promise.all([
      connection.query(query, values),
    ])

    return res[0].rows
  },
  getTeachers: async (id) => {
    const teachersQuery = `
    SELECT
      C.id AS teacher_id,
      C.first_name,
      C.last_name
    FROM
      pensatta_user C
    INNER JOIN
      pensatta_grado A
    ON
      C.id = A.profesor_id
    INNER JOIN
      pensatta_user PC
    ON
      PC.institucion_id = A.institucion_id
    WHERE
      PC.id = $1
    GROUP BY
      C.id;
    `
    const values = [id]

    const res = await Promise.all([
      connection.query(teachersQuery, values),
    ])

    const teachers = res[0].rows

    return teachers
  },
  getResumen: async (id) => {
    const studentsByProfesorID = `
    SELECT
        C.id AS student_id,
        C.username,
        C.first_name,
        C.last_name,
        A.nivel,
        A.curso,
        A.id,
        PC.id as profesor_id,
        PC.first_name as profesor_first_name,
        PC.last_name as profesor_last_name
    FROM
        pensatta_user C
    INNER JOIN
        pensatta_grado_estudiantes B
    ON
        C.id = B.student_id
    INNER JOIN
        pensatta_grado A
    ON
        B.grado_id = A.id
    INNER JOIN
        pensatta_user PC
    ON
        A.profesor_id = PC.id
    WHERE
        A.institucion_id = (SELECT institucion_id FROM pensatta_user WHERE id = $1);
    `
    const values = [id]

    const res = await Promise.all([
      connection.query(studentsByProfesorID, values),
    ])

    const students = res[0].rows

    return groupStudentsByLevelAndCourse(students)
  },
  getStart: async (id) => {
    const queryAverageSpider = `SELECT A.score, B.dimension FROM pensatta_historial A INNER JOIN pensatta_ejercicio B ON A.exercise_id = B.id`
    const queryAverageAll = `SELECT "averageScore" FROM pensatta_calificacion`
    const studentsByProfesorID = `
    SELECT
        A.nivel,
        A.curso,
        A.id AS a_id,
        H.score,
        K.dimension
    FROM
        pensatta_user C
    INNER JOIN
        pensatta_grado_estudiantes B
    ON
        C.id = B.student_id
    INNER JOIN
        pensatta_grado A
    ON
        B.grado_id = A.id
    INNER JOIN
        pensatta_historial H
    ON
        C.id = H.user_id
    INNER JOIN
        pensatta_ejercicio K
    ON
        H.exercise_id = K.id
    WHERE
        A.institucion_id = (SELECT institucion_id FROM pensatta_user WHERE id = $1);
    `
    const profesorInfoQuery = `
    SELECT
      A.first_name,
      A.last_name,
      B.nombre
    FROM
      pensatta_user A
    INNER JOIN
      pensatta_institucion B
    ON
      A.institucion_id = B.id
    WHERE
      A.id = $1;
    `
    const values = [id]

    const res = await Promise.all([
      connection.query(queryAverageSpider),
      connection.query(queryAverageAll),
      connection.query(studentsByProfesorID, values),
      connection.query(profesorInfoQuery, values)
    ])

    const averageAll = res[1].rows.length > 0 ? averageOfList(res[1].rows) : 0
    const [spider, apr] = calculateMetrics(res[0].rows)
    const gradeSpiderAndAprObject = calculateMetricsByCourseAndLevel(res[2].rows)

    return {
      averageAll,
      spiderValues: spider,
      apropiacionValues: apr,
      metrics: gradeSpiderAndAprObject,
      name: `${res[3].rows[0].first_name} ${res[3].rows[0].last_name}`,
      institution: res[3].rows[0].nombre
    }
  }

}

function averageOfList(list) {
  return (list.reduce((acc, item) => acc + item.averageScore, 0) / list.length).toFixed(2)
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

function groupStudentsByLevelAndCourse(studentsArray) {
  const groupedStudents = studentsArray.reduce((result, student) => {
    const key = `${student.nivel}-${student.curso}`;
    
    if (!result[key]) {
      result[key] = {
        level: student.nivel,
        course: student.curso,
        course_id: student.id,
        teacher_name: `${student.profesor_first_name} ${student.profesor_last_name}`,
        teacher_id: student.profesor_id,
        students: [],
      };
    }
    
    result[key].students.push({
      id: student.student_id,
      username: student.username,
      first_name: student.first_name,
      last_name: student.last_name,
    });
    
    return result;
  }, {});

  return Object.values(groupedStudents);
}

function calculateMetricsByCourseAndLevel(data) {
  const resultMap = {};

  data.forEach(item => {
    const { nivel, curso } = item;
    const key = `${nivel}-${curso}`;

    if (!resultMap[key]) {
      resultMap[key] = {
        spider: {},
        apr: { '1': 0, '2': 0, '3': 0 },
        dimCounter: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
        nivel,
        curso,
        idCurso: item.a_id,
      };
    }

    const entry = resultMap[key];
    const { score, dimension } = item;

    // Actualizar los resultados para la dimensión
    if (!entry.spider[dimension]) {
      entry.spider[dimension] = score;
      entry.dimCounter[dimension] = 1;
    } else {
      const currentSum = entry.spider[dimension] * entry.dimCounter[dimension];
      const newSum = currentSum + score;
      entry.spider[dimension] = newSum / (entry.dimCounter[dimension] + 1);
      entry.dimCounter[dimension]++;
    }

    if (score < 60) {
      entry.apr['1']++;
    } else if (score < 80) {
      entry.apr['2']++;
    } else {
      entry.apr['3']++;
    }
  });

  // Truncar los valores de spider a 2 decimales
  for (const key in resultMap) {
    const entry = resultMap[key];
    for (const dimension in entry.spider) {
      entry.spider[dimension] = parseFloat(entry.spider[dimension].toFixed(2));
    }
  }

  return resultMap;
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

function calculateMetricsByStudentID(data) {
  const resultMap = {};

  data.forEach(item => {
    const { student_id: studentID } = item;
    const key = `${studentID}`;

    if (!resultMap[key]) {
      resultMap[key] = {
        spider: {},
        apr: { '1': 0, '2': 0, '3': 0 },
        dimCounter: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
        username: item.username,
        first_name: item.first_name,
        last_name: item.last_name,
        lastHistory: [],
        maxScore: {},
        id: studentID,
      };
    }

    const entry = resultMap[key];
    const { score, dimension, exercise_id } = item;

    // Actualizar los resultados para la dimensión
    if (!entry.spider[dimension]) {
      entry.spider[dimension] = score;
      entry.dimCounter[dimension] = 1;
    } else {
      const currentSum = entry.spider[dimension] * entry.dimCounter[dimension];
      const newSum = currentSum + score;
      entry.spider[dimension] = newSum / (entry.dimCounter[dimension] + 1);
      entry.dimCounter[dimension]++;
    }

    if (entry.lastHistory.length <= 20) {
      entry.lastHistory.push({ score, id: exercise_id });
    } 

    if (!entry.maxScore[exercise_id]) {
      entry.maxScore[exercise_id] = { "1": { score: 0, apr: 0 }, "2": { score: 0, apr: 0 }, "3": { score: 0, apr: 0 } };
    }

    if (score < 60) {
      entry.apr['1']++;
      if (entry.maxScore[exercise_id]['2']['apr'] === 0 && entry.maxScore[exercise_id]['3']['apr'] === 0) {
        entry.maxScore[exercise_id]['1']['apr']=1;
        if (entry.maxScore[exercise_id]['1']['score'] < (item.score/100).toFixed(2))
          entry.maxScore[exercise_id]['1']['score'] = (item.score/100).toFixed(2);
      }
    } else if (score < 80) {
      entry.apr['2']++;
      if (entry.maxScore[exercise_id]['3']['apr'] === 0) {
        entry.maxScore[exercise_id]['2']['apr']=1;
        entry.maxScore[exercise_id]['1']['apr'] = 0;
        entry.maxScore[exercise_id]['1']['score'] = 0;
        if (entry.maxScore[exercise_id]['2']['score'] < (item.score/100).toFixed(2))
          entry.maxScore[exercise_id]['2']['score'] = (item.score/100).toFixed(2)
      }
    } else {
      entry.apr['3']++;
      entry.maxScore[exercise_id]['3']['apr']=1;
      entry.maxScore[exercise_id]['2']['apr'] = 0;
      entry.maxScore[exercise_id]['2']['score'] = 0;
      entry.maxScore[exercise_id]['1']['apr'] = 0;
      entry.maxScore[exercise_id]['1']['score'] = 0;
      if (entry.maxScore[exercise_id]['3']['score'] < (item.score/100).toFixed(2))
        entry.maxScore[exercise_id]['3']['score'] = (item.score/100).toFixed(2)
    }
  });

  // Truncar los valores de spider a 2 decimales
  for (const key in resultMap) {
    const entry = resultMap[key];
    for (const dimension in entry.spider) {
      entry.spider[dimension] = parseFloat(entry.spider[dimension].toFixed(2));
    }
  }

  return resultMap;
}
