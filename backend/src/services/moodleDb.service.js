import pool, { TABLE_PREFIX } from "../config/moodleDb.js";

const T = TABLE_PREFIX;

// ─── Para "Gestión Docente": Total de Accesos ────────────────────────────────

// Cuenta los movimientos RELEVANTES de un profesor en un curso entre dos
// timestamps Unix. NO cuenta entradas o vistas pasivas, solo acciones reales:
//   • Crear/actualizar/eliminar foro o post (mod_forum)
//   • Crear/actualizar/eliminar quiz (mod_quiz)
//   • Crear/actualizar/eliminar/calificar/descargar entregas (mod_assign)
//   • Cualquier calificación (action='graded' o core_grades)
//   • Crear/actualizar cualquier módulo del curso (recursos, materiales)
//
// EXCLUIDO explícitamente:
//   • action='viewed'   (el profe solo entró al curso o a una actividad)
//   • action='loggedin' (login al sistema)
//   • action='reviewed' (revisar intento de quiz sin calificar)
export const countTeacherMovementsInCourse = async (
  userid,
  courseid,
  fromTs,
  toTs
) => {
  const sql = `
    SELECT COUNT(*) AS movimientos
    FROM ${T}logstore_standard_log
    WHERE userid = ?
      AND courseid = ?
      AND timecreated BETWEEN ? AND ?
      AND action NOT IN ('viewed','loggedin','loggedout','reviewed','searched')
      AND (
        (component = 'mod_forum'   AND action IN ('created','updated','deleted'))
        OR (component = 'mod_quiz'    AND action IN ('created','updated','deleted','graded'))
        OR (component = 'mod_assign'  AND action IN ('created','updated','deleted','graded','downloaded','submitted','assessed'))
        OR (component = 'core_grades' AND action IN ('created','updated'))
        OR (target = 'course_module'  AND action IN ('created','updated','deleted'))
        OR (target = 'grade'          AND action IN ('created','updated'))
        OR (action = 'graded')
        OR (action = 'downloaded')
      )
  `;
  const [rows] = await pool.query(sql, [userid, courseid, fromTs, toTs]);
  return Number(rows[0]?.movimientos ?? 0);
};

// Calcula la frecuencia de sesión productiva del profesor en un curso.
//
// Una "sesión" = período desde un evento `course_viewed` hasta el siguiente
// `course_viewed` (o hasta el final del rango). Cada `course_viewed` marca el
// inicio de una nueva sesión, sin importar cuánto tiempo pasó entre eventos.
//
// IMPORTANTE: Moodle dispara un `course_viewed` automático cada vez que
// redirige al usuario al curso después de una acción (crear foro, subir
// archivo, calificar, etc.). Para no contar esos redirects como nuevas
// sesiones, cualquier `course_viewed` que ocurra a menos de 30 segundos del
// evento anterior se considera redirect y se ignora.
//
// Si el primer evento del rango NO es `course_viewed` (el profe entró directo
// a una actividad por bookmark/URL), se cuenta como una sesión también.
//
// Una sesión es "productiva" si contiene al menos un movimiento (crear,
// calificar, descargar, modificar, etc.).
//
// Devuelve:
//   - totalSessions        : ingresos detectados al curso (course_viewed)
//   - sessionsWithMovement : sesiones con al menos un movimiento productivo
//   - percentage           : (sessionsWithMovement / totalSessions) * 100
export const getTeacherCourseSessionFrequency = async (
  userid,
  courseid,
  fromTs,
  toTs
) => {
  const sql = `
    SELECT
      timecreated,
      CASE
        WHEN component = 'core' AND action = 'viewed' AND target = 'course' THEN 1
        ELSE 0
      END AS isCourseEntry,
      CASE
        WHEN action NOT IN ('viewed','loggedin','loggedout','reviewed','searched')
          AND (
            (component = 'mod_forum'   AND action IN ('created','updated','deleted'))
            OR (component = 'mod_quiz'    AND action IN ('created','updated','deleted','graded'))
            OR (component = 'mod_assign'  AND action IN ('created','updated','deleted','graded','downloaded','submitted','assessed'))
            OR (component = 'core_grades' AND action IN ('created','updated'))
            OR (target = 'course_module'  AND action IN ('created','updated','deleted'))
            OR (target = 'grade'          AND action IN ('created','updated'))
            OR action = 'graded'
            OR action = 'downloaded'
          )
        THEN 1 ELSE 0
      END AS isMovement
    FROM ${T}logstore_standard_log
    WHERE userid = ?
      AND courseid = ?
      AND timecreated BETWEEN ? AND ?
    ORDER BY timecreated ASC
  `;

  const [rows] = await pool.query(sql, [userid, courseid, fromTs, toTs]);
  if (rows.length === 0) {
    return { totalSessions: 0, sessionsWithMovement: 0, percentage: 0 };
  }

  // Umbral para detectar redirects automáticos de Moodle
  // (course_viewed disparado por el sistema después de una acción)
  const REDIRECT_THRESHOLD_SEC = 30;

  let totalSessions = 0;
  let sessionsWithMovement = 0;
  let inSession = false;
  let currentSessionHasMovement = false;
  let lastEventTs = -Infinity;

  for (const row of rows) {
    const ts = Number(row.timecreated);
    const isEntry = Number(row.isCourseEntry) === 1;
    const isMov = Number(row.isMovement) === 1;

    // Es un redirect automático si: es course_viewed Y ya hay una sesión activa
    // Y el último evento fue hace menos de REDIRECT_THRESHOLD_SEC segundos
    const isRedirect =
      isEntry &&
      inSession &&
      ts - lastEventTs <= REDIRECT_THRESHOLD_SEC;

    if (isEntry && !isRedirect) {
      // Es una entrada REAL al curso → cerrar sesión anterior y abrir nueva
      if (inSession && currentSessionHasMovement) {
        sessionsWithMovement++;
      }
      totalSessions++;
      inSession = true;
      currentSessionHasMovement = isMov;
    } else {
      // O es un evento normal dentro de la sesión, o es un redirect ignorado
      if (!inSession) {
        // Primer evento del rango no fue course_viewed → arranca sesión implícita
        totalSessions++;
        inSession = true;
        currentSessionHasMovement = false;
      }
      if (isMov) currentSessionHasMovement = true;
    }

    lastEventTs = ts;
  }

  // Cerrar la última sesión
  if (inSession && currentSessionHasMovement) sessionsWithMovement++;

  const percentage =
    totalSessions > 0
      ? Math.round((sessionsWithMovement / totalSessions) * 100)
      : 0;

  return { totalSessions, sessionsWithMovement, percentage };
};

// Cuenta los recursos/materiales publicados por el profesor en un curso
// (creación de un course_module — incluye recursos, archivos, libros, páginas, URLs, etc.)
export const countTeacherResourcesUploaded = async (
  userid,
  courseid,
  fromTs,
  toTs
) => {
  const sql = `
    SELECT COUNT(*) AS recursos
    FROM ${T}logstore_standard_log
    WHERE userid = ?
      AND courseid = ?
      AND timecreated BETWEEN ? AND ?
      AND target = 'course_module'
      AND action = 'created'
  `;
  const [rows] = await pool.query(sql, [userid, courseid, fromTs, toTs]);
  return Number(rows[0]?.recursos ?? 0);
};

// ─── Para "Gestión de Usuarios": último acceso + frecuencia ──────────────────

// Devuelve estadísticas de actividad significativa de un usuario en los cursos
// del departamento. Las sesiones se detectan usando `course_viewed` (igual que
// "Frecuencia de Sesión"), con filtro de redirects automáticos.
//
// Filtros de "movimiento significativo" según rol:
//
//   teacher: crear/modificar/eliminar/calificar/descargar (mismos criterios que
//            countTeacherMovementsInCourse)
//
//   student: entregar tarea, terminar quiz, postear en foro, dar clic a un
//            recurso/material (mod_resource, mod_url, mod_book, mod_folder,
//            mod_page, mod_lesson, etc). NO cuenta solo entrar a la tarea/quiz.
//
// DURACIÓN DE LA SESIÓN:
//   La duración va desde el inicio de la sesión (course_viewed) hasta el
//   ÚLTIMO movimiento productivo de esa sesión. Los eventos posteriores que
//   no sean productivos NO extienden la duración. Si el último movimiento
//   ocurre 30 min después del course_viewed, la sesión dura 30 min — aunque
//   el usuario haya dejado la pestaña abierta más tiempo.
//
// Devuelve:
//   - lastAccess      : timestamp del último movimiento (Unix segundos)
//   - firstAccess     : timestamp del primer movimiento
//   - distinctDays    : días distintos con movimiento significativo
//   - avgSessionHours : duración promedio en horas, **solo de sesiones que
//                       tuvieron al menos un movimiento productivo**
export const getUserMeaningfulActivity = async (userid, role, courseIds = []) => {
  const empty = { lastAccess: 0, firstAccess: 0, distinctDays: 0, avgSessionHours: 0 };
  if (!courseIds.length) return empty;

  let movementConditions;
  if (role === "teacher") {
    movementConditions = `
      action NOT IN ('viewed','loggedin','loggedout','reviewed','searched')
      AND (
        (component = 'mod_forum'   AND action IN ('created','updated','deleted'))
        OR (component = 'mod_quiz'    AND action IN ('created','updated','deleted','graded'))
        OR (component = 'mod_assign'  AND action IN ('created','updated','deleted','graded','downloaded','submitted','assessed'))
        OR (component = 'core_grades' AND action IN ('created','updated'))
        OR (target = 'course_module'  AND action IN ('created','updated','deleted'))
        OR (target = 'grade'          AND action IN ('created','updated'))
        OR (action = 'graded')
        OR (action = 'downloaded')
      )
    `;
  } else if (role === "student") {
    movementConditions = `
      (
        (component = 'mod_assign' AND eventname LIKE '%submitted%')
        OR (component = 'mod_assign' AND eventname LIKE '%submission_created%')
        OR (component = 'mod_quiz'   AND eventname LIKE '%attempt_submitted%')
        OR (component = 'mod_forum'  AND action = 'created')
        OR (component IN (
              'mod_resource','mod_url','mod_book','mod_folder',
              'mod_page','mod_lesson','mod_h5pactivity','mod_scorm',
              'mod_glossary','mod_data'
            ) AND action = 'viewed')
      )
    `;
  } else {
    return empty;
  }

  const placeholders = courseIds.map(() => "?").join(",");

  // Traer TODOS los eventos del usuario en los cursos del departamento.
  // Cada evento marca dos flags: si es course_viewed (entrada al curso) y
  // si es un movimiento productivo según el rol.
  const sql = `
    SELECT
      timecreated,
      CASE
        WHEN component = 'core' AND action = 'viewed' AND target = 'course' THEN 1
        ELSE 0
      END AS isCourseEntry,
      CASE WHEN ${movementConditions} THEN 1 ELSE 0 END AS isMovement
    FROM ${T}logstore_standard_log
    WHERE userid = ?
      AND courseid IN (${placeholders})
    ORDER BY timecreated ASC
  `;

  const [rows] = await pool.query(sql, [userid, ...courseIds]);
  if (rows.length === 0) return empty;

  // ── Detección de sesiones (Opción B: course_viewed = nueva sesión) ──────
  const REDIRECT_THRESHOLD_SEC = 30; // ignora course_viewed automáticos
  const MIN_SESSION_SEC = 5 * 60;    // sesión productiva sin duración = mínimo 5 min

  // Cada sesión guarda: firstTs (course_viewed), lastMovTs (último movimiento
  // productivo) y hasMovement. La duración será lastMovTs - firstTs.
  const sessions = [];
  const meaningfulTimestamps = [];
  let lastEventTs = -Infinity;
  let currentSession = null;

  for (const row of rows) {
    const ts = Number(row.timecreated);
    const isEntry = Number(row.isCourseEntry) === 1;
    const isMov = Number(row.isMovement) === 1;

    if (isMov) meaningfulTimestamps.push(ts);

    // ¿Es un redirect automático de Moodle?
    const isRedirect =
      isEntry &&
      currentSession &&
      ts - lastEventTs <= REDIRECT_THRESHOLD_SEC;

    if (isEntry && !isRedirect) {
      // Entrada REAL al curso → cerrar sesión anterior y abrir una nueva
      if (currentSession) sessions.push(currentSession);
      currentSession = {
        firstTs: ts,
        lastMovTs: isMov ? ts : null,
        hasMovement: isMov,
      };
    } else {
      // Evento dentro de la sesión actual o redirect ignorado
      if (!currentSession) {
        // Primer evento del rango no es course_viewed → sesión implícita
        currentSession = {
          firstTs: ts,
          lastMovTs: isMov ? ts : null,
          hasMovement: isMov,
        };
      } else if (isMov) {
        // SOLO los movimientos productivos extienden la duración
        currentSession.lastMovTs = ts;
        currentSession.hasMovement = true;
      }
    }

    lastEventTs = ts;
  }

  if (currentSession) sessions.push(currentSession);

  // Solo promediar sesiones con al menos un movimiento productivo
  const productiveSessions = sessions.filter((s) => s.hasMovement);

  let avgSessionHours = 0;
  if (productiveSessions.length > 0) {
    const totalSec = productiveSessions.reduce((sum, s) => {
      // Duración = desde course_viewed hasta el último movimiento productivo
      const duration = (s.lastMovTs ?? s.firstTs) - s.firstTs;
      return sum + Math.max(duration, MIN_SESSION_SEC);
    }, 0);
    avgSessionHours = Number(
      (totalSec / productiveSessions.length / 3600).toFixed(2)
    );
  }

  // ── lastAccess, firstAccess, distinctDays sobre eventos significativos ──
  if (meaningfulTimestamps.length === 0) {
    return { lastAccess: 0, firstAccess: 0, distinctDays: 0, avgSessionHours };
  }

  const lastAccess = meaningfulTimestamps[meaningfulTimestamps.length - 1];
  const firstAccess = meaningfulTimestamps[0];

  const dayKeys = new Set();
  for (const ts of meaningfulTimestamps) {
    const d = new Date(ts * 1000);
    dayKeys.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
  }
  const distinctDays = dayKeys.size;

  return { lastAccess, firstAccess, distinctDays, avgSessionHours };
};

// ─── Para "Gestión de Movimientos Docentes" ──────────────────────────────────

// Total de entregas (status='submitted') para una assignment.
// Opcionalmente filtra por rango de fechas (timemodified).
export const countAssignmentSubmissions = async (assignmentid, fromTs = null, toTs = null) => {
  let sql = `
    SELECT COUNT(DISTINCT userid) AS total
    FROM ${T}assign_submission
    WHERE assignment = ?
      AND status = 'submitted'
      AND latest = 1
  `;
  const params = [assignmentid];
  if (fromTs && toTs) {
    sql += ` AND timemodified BETWEEN ? AND ?`;
    params.push(fromTs, toTs);
  }
  const [rows] = await pool.query(sql, params);
  return Number(rows[0]?.total ?? 0);
};

// Cuántas de esas entregas fueron calificadas en la plataforma
// (existe registro en assign_grades con grade >= 0).
// Opcionalmente filtra la calificación por rango de fechas.
export const countAssignmentGraded = async (assignmentid, fromTs = null, toTs = null) => {
  let sql = `
    SELECT COUNT(DISTINCT g.userid) AS total
    FROM ${T}assign_grades g
    INNER JOIN ${T}assign_submission s
      ON s.assignment = g.assignment
     AND s.userid = g.userid
     AND s.status = 'submitted'
     AND s.latest = 1
    WHERE g.assignment = ?
      AND g.grade IS NOT NULL
      AND g.grade >= 0
  `;
  const params = [assignmentid];
  if (fromTs && toTs) {
    sql += ` AND g.timemodified BETWEEN ? AND ?`;
    params.push(fromTs, toTs);
  }
  const [rows] = await pool.query(sql, params);
  return Number(rows[0]?.total ?? 0);
};

// ¿El profesor descargó las entregas (la plantilla/zip) de esta assignment?
// Moodle registra eventos como \mod_assign\event\all_submissions_downloaded.
// Opcionalmente filtra por rango de fechas del evento.
export const teacherDownloadedSubmissions = async (userid, assignmentid, fromTs = null, toTs = null) => {
  let sql = `
    SELECT COUNT(*) AS total
    FROM ${T}logstore_standard_log
    WHERE userid = ?
      AND component = 'mod_assign'
      AND (
        action = 'downloaded'
        OR eventname LIKE '%downloaded%'
      )
      AND objectid = ?
  `;
  const params = [userid, assignmentid];
  if (fromTs && toTs) {
    sql += ` AND timecreated BETWEEN ? AND ?`;
    params.push(fromTs, toTs);
  }
  sql += ` LIMIT 1`;
  const [rows] = await pool.query(sql, params);
  return Number(rows[0]?.total ?? 0) > 0;
};

// Devuelve el timestamp del primer evento registrado en cualquiera de los
// cursos dados. Útil para determinar desde qué semestre hay datos.
export const getEarliestEventInCourses = async (courseIds = []) => {
  if (!courseIds.length) return null;
  const placeholders = courseIds.map(() => "?").join(",");
  const sql = `
    SELECT MIN(timecreated) AS minTs
    FROM ${T}logstore_standard_log
    WHERE courseid IN (${placeholders})
  `;
  const [rows] = await pool.query(sql, courseIds);
  const minTs = Number(rows[0]?.minTs ?? 0);
  return minTs > 0 ? minTs : null;
};
