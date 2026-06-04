import {
  getUserCourses,
  getCourseEnrolledUsers,
  getCourseAssignments,
  getAssignmentSubmissions,
  getCourseQuizzes,
  getQuizUserAttempts,
  getCourseForums,
} from "../services/moodle.service.js";
import { computeCourseStats } from "../services/grades.service.js";
import {
  getUserMeaningfulActivity,
  countForumPostsByUser,
  getLastCourseAccess,
} from "../services/moodleDb.service.js";
import { computeRiskScore, RISK_WEIGHTS, RISK_THRESHOLDS } from "../services/riskScore.service.js";
import { getCached, setCached } from "../utils/cache.js";

// ─────────────────────────────────────────────────────────────────────────────
// computeRiskStudents(uid): función reutilizable (la usan el mapa de riesgo y
// las notificaciones). Devuelve { counts, students } con score ponderado.
// Cachea su resultado 5 min para no recalcular en cada petición.
// ─────────────────────────────────────────────────────────────────────────────
export const computeRiskStudents = async (uid) => {
  const cacheKey = `risk-students:${uid}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) return cached;

  const courses = await getUserCourses(uid);
  const courseIds = courses.map((c) => c.id);
  const now = Math.floor(Date.now() / 1000);

  const studentMap = new Map();
  const upsert = (s) => {
    if (!studentMap.has(s.id)) {
      studentMap.set(s.id, {
        id: s.id,
        nombre:
          s.fullname ||
          `${s.firstname ?? ""} ${s.lastname ?? ""}`.trim() ||
          `Usuario ${s.id}`,
        email: s.email || "",
        avgs: [],
        notSubmitted: 0,
        totalVencidas: 0,
        lateSubmissions: 0,
        lostQuizzes: 0,
        lastActivity: 0,
      });
    }
    return studentMap.get(s.id);
  };

  let forosDisponibles = 0;

  for (const course of courses) {
    let students = [];
    try {
      const users = await getCourseEnrolledUsers(course.id);
      students = users.filter((u) =>
        (u.roles ?? []).some((r) => r.shortname === "student")
      );
      for (const s of students) upsert(s);
    } catch (err) {
      console.warn(`⚠️ Estudiantes curso ${course.id}:`, err.message);
      continue;
    }

    const studentIdSet = new Set(students.map((s) => s.id));

    // Promedio por estudiante
    for (const s of students) {
      try {
        const { promedio } = await computeCourseStats(s.id, course.id);
        if (promedio !== null) studentMap.get(s.id).avgs.push(promedio);
      } catch {}
    }

    // Foros disponibles del curso
    try {
      const forums = await getCourseForums([course.id]);
      forosDisponibles += forums.length;
    } catch {}

    // ASSIGNMENTS
    let assignments = [];
    try {
      const ac = await getCourseAssignments([course.id]);
      assignments = ac[0]?.assignments ?? [];
    } catch {}

    if (assignments.length > 0) {
      let bulk = [];
      try {
        bulk = await getAssignmentSubmissions(assignments.map((a) => a.id));
      } catch {}

      for (const ag of bulk) {
        const assign = assignments.find((a) => a.id === ag.assignmentid);
        const due = assign?.duedate ?? 0;
        const vencida = due > 0 && now > due;
        const submittedUsers = new Set();

        for (const sub of ag.submissions ?? []) {
          if (!studentIdSet.has(sub.userid)) continue;
          if (sub.status !== "submitted" && sub.status !== "graded") continue;
          submittedUsers.add(sub.userid);
          const rec = studentMap.get(sub.userid);
          const t = sub.timemodified || sub.timecreated || 0;
          if (due > 0 && t > 0 && t > due) rec.lateSubmissions++;
          if (t > rec.lastActivity) rec.lastActivity = t;
        }

        if (vencida) {
          for (const sid of studentIdSet) {
            const rec = studentMap.get(sid);
            rec.totalVencidas++;
            if (!submittedUsers.has(sid)) rec.notSubmitted++;
          }
        }
      }
    }

    // QUIZZES
    let quizzes = [];
    try {
      quizzes = await getCourseQuizzes([course.id]);
    } catch {}

    for (const quiz of quizzes) {
      const timeclose = quiz.timeclose ?? 0;
      const vencida = timeclose > 0 && now > timeclose;
      for (const s of students) {
        const rec = studentMap.get(s.id);
        try {
          const attempts = await getQuizUserAttempts(quiz.id, s.id);
          const finished = attempts.filter((a) => a.state === "finished");
          if (vencida) rec.totalVencidas++;
          if (finished.length === 0) {
            if (vencida) {
              rec.notSubmitted++;
              rec.lostQuizzes++;
            }
          } else {
            const last = finished[finished.length - 1];
            const t = last.timefinish ?? 0;
            if (t > rec.lastActivity) rec.lastActivity = t;
          }
        } catch {}
      }
    }
  }

  // ── Señales desde la BD de Moodle (logs) + score por estudiante ──────────
  const studentsList = [];
  for (const [, rec] of studentMap) {
    const promedio =
      rec.avgs.length > 0
        ? rec.avgs.reduce((a, b) => a + b, 0) / rec.avgs.length
        : null;

    // Señales de log (días sin acceso, horas, foros)
    let lastAccessTs = 0;
    let totalHoras = 0;
    let forosParticipados = 0;
    try {
      lastAccessTs = await getLastCourseAccess(rec.id, courseIds);
    } catch {}
    try {
      const act = await getUserMeaningfulActivity(rec.id, "student", courseIds);
      totalHoras = act.totalHours ?? 0;
    } catch {}
    try {
      const posts = await countForumPostsByUser(rec.id, courseIds);
      forosParticipados = Math.min(posts, forosDisponibles || posts);
    } catch {}

    const diasSinAcceso =
      lastAccessTs > 0 ? Math.floor((now - lastAccessTs) / 86400) : null;

    const { score, level, signals, breakdown } = computeRiskScore({
      promedio,
      noEntregadas: rec.notSubmitted,
      totalVencidas: rec.totalVencidas,
      diasSinAcceso,
      forosParticipados,
      forosDisponibles,
      totalHoras,
    });

    // Alertas legibles según las señales
    const alerts = [];
    if (signals.promedio >= 0.4) alerts.push("Bajo rendimiento");
    if (diasSinAcceso != null && diasSinAcceso >= 7) alerts.push("Inactividad prolongada");
    else if (diasSinAcceso == null) alerts.push("Sin accesos registrados");
    if (rec.notSubmitted >= 1) alerts.push("Entregas sin realizar");
    if (forosDisponibles > 0 && forosParticipados === 0) alerts.push("Sin participación en foros");
    if (signals.horasDedicacion >= 0.8) alerts.push("Baja dedicación");

    studentsList.push({
      id: rec.id,
      nombre: rec.nombre,
      email: rec.email,
      promedio: promedio !== null ? Number(promedio.toFixed(2)) : null,
      score,
      level,
      breakdown,
      diasSinAcceso,
      totalHoras,
      notSubmitted: rec.notSubmitted,
      forosParticipados,
      forosDisponibles,
      lastActivity: lastAccessTs > 0 ? lastAccessTs * 1000 : null,
      alerts,
    });
  }

  // Orden: por score descendente (mayor riesgo primero)
  studentsList.sort((a, b) => b.score - a.score);

  const counts = {
    high: studentsList.filter((s) => s.level === "high").length,
    medium: studentsList.filter((s) => s.level === "medium").length,
    low: studentsList.filter((s) => s.level === "low").length,
  };

  const result = {
    counts,
    students: studentsList,
    weights: RISK_WEIGHTS,
    thresholds: RISK_THRESHOLDS,
  };
  setCached(cacheKey, result, 5 * 60 * 1000);
  return result;
};

// GET /api/moodle/teacher/risk-map?userId=X
export const getTeacherRiskMap = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ ok: false, msg: "userId requerido" });
    const result = await computeRiskStudents(parseInt(userId));
    return res.json({ ok: true, ...result });
  } catch (error) {
    console.error("❌ Error teacher risk-map:", error.message);
    return res
      .status(500)
      .json({ ok: false, msg: "Error al obtener mapa de riesgo" });
  }
};
